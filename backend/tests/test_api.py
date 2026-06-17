"""API tests for Budgie — happy paths and negative tests."""

import json
from datetime import datetime, timezone

from api.models import Bucket, MonthlySnapshot, UserProfile
from django.contrib.auth.models import User
from django.test import TestCase


class AuthTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test-user", password="mypassword"
        )

    def _login(self, username="test-user", password="mypassword"):
        return self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": username, "password": password}),
            content_type="application/json",
        )

    def test_login_success(self):
        resp = self._login()
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("user", data)
        self.assertEqual(data["user"]["name"], "test-user")
        self.assertEqual(data["user"]["role"], "user")
        self.assertIn("sessionid", resp.cookies)

    def test_login_tracks_login_count(self):
        resp = self._login()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["user"]["login_count"], 1)
        resp = self._login()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["user"]["login_count"], 2)

    def test_login_invalid_password(self):
        resp = self._login(password="wrong")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["error"], "invalid credentials")

    def test_login_nonexistent_user(self):
        resp = self._login(username="nobody", password="x")
        self.assertEqual(resp.status_code, 401)

    def test_login_missing_body(self):
        resp = self.client.post(
            "/api/auth/login", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(resp.status_code, 422)

    def test_logout(self):
        self._login()
        resp = self.client.post(
            "/api/auth/logout", data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(resp.status_code, 200)


class BucketHappyTests(TestCase):
    """Happy-path CRUD tests for buckets."""

    def setUp(self):
        self.user = User.objects.create_user(username="bucket-owner", password="pass")
        UserProfile.objects.create(user=self.user)
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bucket-owner", "password": "pass"}),
            content_type="application/json",
        )

    def test_create_bucket(self):
        resp = self.client.post(
            "/api/buckets/",
            data=json.dumps(
                {
                    "name": "Groceries",
                    "amount": 200.0,
                    "currency": "AUD",
                    "color": "#FF5733",
                    "icon": "shopping",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["name"], "Groceries")
        self.assertEqual(data["amount"], 200.0)
        self.assertEqual(data["spent"], 0.0)
        self.assertGreater(data["id"], 0)

    def test_create_bucket_uses_defaults(self):
        resp = self.client.post(
            "/api/buckets/",
            data=json.dumps({"name": "Default", "amount": 100.0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["currency"], "AUD")
        self.assertEqual(data["color"], "#3B82F6")
        self.assertEqual(data["icon"], "wallet")

    def test_list_buckets(self):
        Bucket.objects.create(name="Rent", amount=100000, owner_id=self.user.pk)
        resp = self.client.get("/api/buckets/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Rent")

    def test_get_bucket(self):
        b = Bucket.objects.create(name="Rent", amount=100000, owner_id=self.user.pk)
        resp = self.client.get(f"/api/buckets/{b.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["name"], "Rent")

    def test_update_bucket(self):
        b = Bucket.objects.create(name="Rent", amount=100000, owner_id=self.user.pk)
        resp = self.client.put(
            f"/api/buckets/{b.id}",
            data=json.dumps({"name": "Updated Rent", "amount": 1500.0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["name"], "Updated Rent")
        self.assertEqual(resp.json()["amount"], 1500.0)

    def test_delete_bucket(self):
        b = Bucket.objects.create(name="Temp", amount=50000, owner_id=self.user.pk)
        resp = self.client.delete(f"/api/buckets/{b.id}")
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Bucket.objects.filter(id=b.id).count(), 0)

    def test_reset_bucket(self):
        b = Bucket.objects.create(
            name="ResetMe", amount=100000, spent=50000, owner_id=self.user.pk
        )
        resp = self.client.post(
            f"/api/buckets/{b.id}/reset",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["spent"], 0.0)

        snapshots = MonthlySnapshot.objects.filter(bucket=b)
        self.assertEqual(snapshots.count(), 1)
        self.assertEqual(snapshots.first().budget, 100000)
        self.assertEqual(snapshots.first().spent, 50000)

    def test_share_bucket(self):
        other = User.objects.create_user(username="other-user", password="5678")
        b = Bucket.objects.create(name="SharedBucket", amount=50000, owner_id=self.user.pk)
        resp = self.client.post(
            f"/api/buckets/{b.id}/share",
            data=json.dumps({"user_id": other.id, "permission": "read"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        b.refresh_from_db()
        self.assertTrue(b.shared)

    def test_list_shares(self):
        other = User.objects.create_user(username="share-target", password="1234")
        b = Bucket.objects.create(name="MyBucket", amount=50000, owner_id=self.user.pk)
        self.client.post(
            f"/api/buckets/{b.id}/share",
            data=json.dumps({"user_id": other.id, "permission": "read"}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{b.id}/shares")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["user_id"], other.id)
        self.assertEqual(data[0]["permission"], "read")

    def test_remove_share(self):
        other = User.objects.create_user(username="remove-target", password="1234")
        b = Bucket.objects.create(name="MyBucket", amount=50000, owner_id=self.user.pk)
        self.client.post(
            f"/api/buckets/{b.id}/share",
            data=json.dumps({"user_id": other.id, "permission": "read"}),
            content_type="application/json",
        )
        resp = self.client.delete(f"/api/buckets/{b.id}/share/{other.id}")
        self.assertEqual(resp.status_code, 204)
        b.refresh_from_db()
        self.assertFalse(b.shared)

    def test_list_logs(self):
        b = Bucket.objects.create(name="LogMe", amount=50000, owner_id=self.user.pk)
        self.client.post(
            f"/api/buckets/{b.id}/reset",
            data=json.dumps({}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{b.id}/logs")
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.json()), 1)


class BucketNegativeTests(TestCase):
    """Negative tests for bucket endpoints — permission checks, edge cases."""

    def setUp(self):
        self.alice = User.objects.create_user(username="alice", password="alicepass")
        self.bob = User.objects.create_user(username="bob", password="bobpass")
        UserProfile.objects.create(user=self.alice)
        UserProfile.objects.create(user=self.bob)

        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        self.bucket = Bucket.objects.create(
            name="AliceBucket", amount=100000, owner=self.alice
        )
        self.client.post(
            "/api/auth/logout", data=json.dumps({}), content_type="application/json"
        )

    def test_auth_required_for_list(self):
        resp = self.client.get("/api/buckets/")
        self.assertEqual(resp.status_code, 401)

    def test_auth_required_for_get(self):
        resp = self.client.get(f"/api/buckets/{self.bucket.id}")
        self.assertEqual(resp.status_code, 401)

    def test_get_other_users_bucket_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{self.bucket.id}")
        self.assertEqual(resp.status_code, 404)

    def test_update_other_users_bucket_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.put(
            f"/api/buckets/{self.bucket.id}",
            data=json.dumps({"name": "Hijacked"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_delete_other_users_bucket_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.delete(f"/api/buckets/{self.bucket.id}")
        self.assertEqual(resp.status_code, 404)

    def test_reset_other_users_bucket_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/reset",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_share_bucket_as_non_owner_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        other = User.objects.create_user(username="third", password="pass")
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/share",
            data=json.dumps({"user_id": other.id, "permission": "read"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_list_shares_on_non_owned_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{self.bucket.id}/shares")
        self.assertEqual(resp.status_code, 404)

    def test_remove_share_as_non_owner_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.delete(f"/api/buckets/{self.bucket.id}/share/{self.bob.id}")
        self.assertEqual(resp.status_code, 404)

    def test_logs_on_non_owned_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{self.bucket.id}/logs")
        self.assertEqual(resp.status_code, 404)

    def test_create_bucket_missing_name(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            "/api/buckets/",
            data=json.dumps({"amount": 100.0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)

    def test_get_nonexistent_bucket(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.get("/api/buckets/99999")
        self.assertEqual(resp.status_code, 404)

    def test_delete_nonexistent_bucket(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.delete("/api/buckets/99999")
        self.assertEqual(resp.status_code, 404)


class TransactionHappyTests(TestCase):
    """Happy-path CRUD tests for transactions."""

    def setUp(self):
        self.user = User.objects.create_user(username="tx-owner", password="pass")
        UserProfile.objects.create(user=self.user)
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "tx-owner", "password": "pass"}),
            content_type="application/json",
        )
        self.bucket = Bucket.objects.create(
            name="Groceries", amount=50000, owner_id=self.user.pk
        )

    def _create_tx(self, amount=25.50, notes="Weekly groceries"):
        return self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "amount": amount,
                    "notes": notes,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        )

    def test_create_transaction(self):
        resp = self._create_tx()
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["amount"], 25.50)
        self.assertEqual(data["notes"], "Weekly groceries")
        self.bucket.refresh_from_db()
        self.assertEqual(self.bucket.spent, 2550)

    def test_list_transactions(self):
        self._create_tx()
        resp = self.client.get(f"/api/buckets/{self.bucket.id}/transactions")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 1)

    def test_list_transactions_with_deleted(self):
        self._create_tx(amount=10.0)
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "amount": 5.0,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        )
        tx2_id = resp.json()["id"]
        self.client.delete(f"/api/transactions/{tx2_id}")
        resp = self.client.get(
            f"/api/buckets/{self.bucket.id}/transactions?include_deleted=true"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.json()), 2)

    def test_update_transaction(self):
        resp = self._create_tx(amount=50.0)
        tx_id = resp.json()["id"]
        resp = self.client.put(
            f"/api/transactions/{tx_id}",
            data=json.dumps({"amount": 75.0, "notes": "Updated"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["amount"], 75.0)
        self.assertEqual(resp.json()["notes"], "Updated")
        self.bucket.refresh_from_db()
        self.assertEqual(self.bucket.spent, 7500)

    def test_soft_delete_and_undo(self):
        resp = self._create_tx(amount=50.0)
        tx_id = resp.json()["id"]
        resp = self.client.delete(f"/api/transactions/{tx_id}")
        self.assertEqual(resp.status_code, 204)
        self.bucket.refresh_from_db()
        self.assertEqual(self.bucket.spent, 0)
        resp = self.client.post(
            f"/api/transactions/{tx_id}/undo",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIsNone(resp.json()["deleted_at"])
        self.bucket.refresh_from_db()
        self.assertEqual(self.bucket.spent, 5000)

    def test_create_transaction_without_notes(self):
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "amount": 15.0,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertIsNone(resp.json()["notes"])


class TransactionNegativeTests(TestCase):
    """Negative tests for transaction endpoints."""

    def setUp(self):
        self.alice = User.objects.create_user(username="alice", password="alicepass")
        self.bob = User.objects.create_user(username="bob", password="bobpass")
        UserProfile.objects.create(user=self.alice)
        UserProfile.objects.create(user=self.bob)

        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        self.bucket = Bucket.objects.create(
            name="AliceBucket", amount=100000, owner=self.alice
        )
        self.tx = self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "amount": 25.0,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        ).json()
        self.client.post(
            "/api/auth/logout", data=json.dumps({}), content_type="application/json"
        )

    def test_list_transactions_on_other_bucket_returns_empty(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.get(f"/api/buckets/{self.bucket.id}/transactions")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 0)

    def test_create_transaction_on_other_bucket_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "amount": 10.0,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_update_other_users_transaction_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.put(
            f"/api/transactions/{self.tx['id']}",
            data=json.dumps({"amount": 99.0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_delete_other_users_transaction_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.delete(f"/api/transactions/{self.tx['id']}")
        self.assertEqual(resp.status_code, 404)

    def test_undo_other_users_transaction_returns_404(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "bob", "password": "bobpass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            f"/api/transactions/{self.tx['id']}/undo",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_undo_non_deleted_transaction_returns_422(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            f"/api/transactions/{self.tx['id']}/undo",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)

    def test_auth_required_for_list(self):
        resp = self.client.get(f"/api/buckets/{self.bucket.id}/transactions")
        self.assertEqual(resp.status_code, 401)

    def test_create_missing_amount(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            f"/api/buckets/{self.bucket.id}/transactions",
            data=json.dumps(
                {
                    "bucket_id": self.bucket.id,
                    "spent_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)

    def test_get_nonexistent_transaction(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "alice", "password": "alicepass"}),
            content_type="application/json",
        )
        resp = self.client.put(
            "/api/transactions/99999",
            data=json.dumps({"amount": 10.0}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 404)


class SettingsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="settings-user", password="pass")
        UserProfile.objects.create(user=self.user)
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "settings-user", "password": "pass"}),
            content_type="application/json",
        )

    def test_get_settings_creates_default(self):
        resp = self.client.get("/api/settings/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["base_currency"], "AUD")
        self.assertEqual(resp.json()["theme"], "light")

    def test_update_settings(self):
        resp = self.client.put(
            "/api/settings/",
            data=json.dumps({"base_currency": "USD", "theme": "dark"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["base_currency"], "USD")
        self.assertEqual(resp.json()["theme"], "dark")

    def test_update_settings_persists_across_calls(self):
        self.client.put(
            "/api/settings/",
            data=json.dumps({"base_currency": "EUR", "theme": "dark"}),
            content_type="application/json",
        )
        resp = self.client.get("/api/settings/")
        self.assertEqual(resp.json()["base_currency"], "EUR")
        self.assertEqual(resp.json()["theme"], "dark")

    def test_auth_required(self):
        self.client.post(
            "/api/auth/logout", data=json.dumps({}), content_type="application/json"
        )
        resp = self.client.get("/api/settings/")
        self.assertEqual(resp.status_code, 401)

    def test_update_missing_fields(self):
        resp = self.client.put(
            "/api/settings/",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)


class UserManagementTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="adminpass", is_staff=True
        )
        self.user = User.objects.create_user(username="regular", password="userpass")
        UserProfile.objects.create(user=self.admin)
        UserProfile.objects.create(user=self.user)

    def _admin_login(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "admin", "password": "adminpass"}),
            content_type="application/json",
        )

    def test_admin_list_users(self):
        self._admin_login()
        resp = self.client.get("/api/users/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 2)

    def test_non_admin_blocked_from_list(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "regular", "password": "userpass"}),
            content_type="application/json",
        )
        resp = self.client.get("/api/users/")
        self.assertEqual(resp.status_code, 403)

    def test_non_admin_blocked_from_create(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "regular", "password": "userpass"}),
            content_type="application/json",
        )
        resp = self.client.post(
            "/api/users/",
            data=json.dumps({"name": "hacker", "password": "9999"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 403)

    def test_non_admin_blocked_from_delete(self):
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "regular", "password": "userpass"}),
            content_type="application/json",
        )
        resp = self.client.delete("/api/users/1")
        self.assertEqual(resp.status_code, 403)

    def test_admin_create_user(self):
        self._admin_login()
        resp = self.client.post(
            "/api/users/",
            data=json.dumps({"name": "new-user", "password": "9999"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["name"], "new-user")
        self.assertEqual(resp.json()["role"], "user")

    def test_admin_create_duplicate_user(self):
        self._admin_login()
        resp = self.client.post(
            "/api/users/",
            data=json.dumps({"name": "regular", "password": "newpass"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 422)

    def test_admin_delete_user(self):
        self._admin_login()
        target = User.objects.create_user(username="delete-me", password="0000")
        UserProfile.objects.create(user=target)
        resp = self.client.delete(f"/api/users/{target.id}")
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(User.objects.filter(id=target.id).count(), 0)

    def test_admin_delete_nonexistent_user(self):
        self._admin_login()
        resp = self.client.delete("/api/users/99999")
        self.assertEqual(resp.status_code, 204)

    def test_admin_blocked_without_login(self):
        resp = self.client.get("/api/users/")
        self.assertEqual(resp.status_code, 401)

    def test_admin_create_without_login(self):
        resp = self.client.post(
            "/api/users/",
            data=json.dumps({"name": "unauth", "password": "pass"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)


class InsightsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="insight-user", password="pass")
        UserProfile.objects.create(user=self.user)
        self.client.post(
            "/api/auth/login",
            data=json.dumps({"username": "insight-user", "password": "pass"}),
            content_type="application/json",
        )
        self.bucket = Bucket.objects.create(
            name="TestBucket", amount=100000, owner_id=self.user.pk
        )

    def test_summary_empty_returns_empty_list(self):
        resp = self.client.get("/api/insights/summary")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])

    def test_monthly_empty_returns_empty_list(self):
        resp = self.client.get("/api/insights/monthly")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])

    def test_summary_after_reset(self):
        self.client.post(
            f"/api/buckets/{self.bucket.id}/reset",
            data=json.dumps({}),
            content_type="application/json",
        )
        resp = self.client.get("/api/insights/summary")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]["total_budget"], 1000.0)

    def test_monthly_after_reset(self):
        self.client.post(
            f"/api/buckets/{self.bucket.id}/reset",
            data=json.dumps({}),
            content_type="application/json",
        )
        resp = self.client.get("/api/insights/monthly")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)

    def test_auth_required(self):
        self.client.post(
            "/api/auth/logout", data=json.dumps({}), content_type="application/json"
        )
        resp = self.client.get("/api/insights/summary")
        self.assertEqual(resp.status_code, 401)
