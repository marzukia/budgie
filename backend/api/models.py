"""Django models for Budgie."""

from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True
    )
    login_count = models.IntegerField(default=0)

    class Meta:
        db_table = "user_profile"


class Bucket(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    amount = models.IntegerField(default=0)
    spent = models.IntegerField(default=0)
    currency = models.CharField(max_length=3, default="AUD")
    color = models.CharField(max_length=7, default="#3B82F6")
    icon = models.CharField(max_length=100, default="wallet")
    distribute_to_period = models.CharField(max_length=50, default="monthly")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shared = models.BooleanField(default=False)

    class Meta:
        db_table = "bucket"


class BucketShare(models.Model):
    bucket = models.ForeignKey(Bucket, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    permission = models.CharField(max_length=50, default="read")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bucket_share"


class Transaction(models.Model):
    amount = models.IntegerField()
    notes = models.TextField(null=True, blank=True)
    spent_at = models.DateTimeField()
    deleted_at = models.DateTimeField(null=True, blank=True)
    bucket = models.ForeignKey(Bucket, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "transaction"


class BucketLog(models.Model):
    action = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    bucket = models.ForeignKey(Bucket, on_delete=models.CASCADE)

    class Meta:
        db_table = "bucket_log"


class MonthlySnapshot(models.Model):
    month = models.IntegerField()
    year = models.IntegerField()
    budget = models.IntegerField()
    spent = models.IntegerField()
    remaining = models.IntegerField()
    bucket = models.ForeignKey(Bucket, on_delete=models.CASCADE)

    class Meta:
        db_table = "monthly_snapshot"


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True
    )
    base_currency = models.CharField(max_length=3, default="AUD")
    theme = models.CharField(max_length=50, default="light")

    class Meta:
        db_table = "user_settings"
