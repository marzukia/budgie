"""User views — admin user management."""

from django.contrib.auth.models import User
from ninja import Router, Status

from api.auth import auth
from api.models import UserProfile
from api.schemas import ErrorResponse, UserCreate, UserResponse

router = Router(tags=["users"])


def _user_to_response(u: User) -> UserResponse:
    profile = UserProfile.objects.filter(user=u).first()
    return UserResponse(
        id=u.id,
        name=u.username,
        role="admin" if u.is_staff else "user",
        last_login_at=u.last_login,
        login_count=profile.login_count if profile else 0,
        created_at=u.date_joined,
    )


@router.get("/", response={200: list[UserResponse], 403: ErrorResponse}, auth=auth)
def list_users(request):
    if not request.user.is_staff:
        return Status(403, {"error": "admin only"})
    users = User.objects.all()
    return [_user_to_response(u) for u in users]


@router.post(
    "/", response={201: UserResponse, 403: ErrorResponse, 422: ErrorResponse}, auth=auth
)
def create_user(request, body: UserCreate):
    if not request.user.is_staff:
        return Status(403, {"error": "admin only"})

    user = User.objects.create_user(
        username=body.name,
        password=body.password,
        is_staff=False,
    )
    UserProfile.objects.create(user=user)
    return Status(201, _user_to_response(user))


@router.delete("/{user_id}", response={204: None, 403: ErrorResponse}, auth=auth)
def delete_user(request, user_id: int):
    if not request.user.is_staff:
        return Status(403, {"error": "admin only"})
    User.objects.filter(id=user_id).delete()
    return Status(204, None)
