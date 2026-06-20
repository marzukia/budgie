from django.contrib.auth.models import User
from ninja import Router, Status

from api.auth import auth
from api.models import UserProfile
from api.schemas import ErrorResponse, UserCreate, UserResponse, UserUpdate
from api.views.auth import _check_admin, _get_role

router = Router(tags=["users"])


def _user_to_response(u: User) -> UserResponse:
    profile = UserProfile.objects.filter(user=u).first()
    return UserResponse(
        id=u.id,
        name=u.username,
        role=_get_role(u),
        last_login_at=u.last_login,
        login_count=profile.login_count if profile else 0,
        created_at=u.date_joined,
    )


@router.get("/", response={200: list[UserResponse], 403: ErrorResponse}, auth=auth)
def list_users(request):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin only"})
    users = User.objects.all()
    return [_user_to_response(u) for u in users]


@router.post(
    "/", response={201: UserResponse, 403: ErrorResponse, 422: ErrorResponse}, auth=auth
)
def create_user(request, body: UserCreate):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin only"})

    user = User.objects.create_user(
        username=body.name,
        password=body.password,
        is_staff=False,
    )
    UserProfile.objects.create(user=user)
    return Status(201, _user_to_response(user))


@router.patch(
    "/{user_id}",
    response={200: UserResponse, 403: ErrorResponse, 404: ErrorResponse},
    auth=auth,
)
def update_user(request, user_id: int, body: UserUpdate):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin only"})
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Status(404, {"error": "User not found"})
    if body.name is not None:
        user.username = body.name
    if body.password is not None:
        user.set_password(body.password)
    if body.is_staff is not None:
        user.is_staff = body.is_staff
    user.save()
    return Status(200, _user_to_response(user))


@router.get(
    "/{user_id}",
    response={200: UserResponse, 403: ErrorResponse, 404: ErrorResponse},
    auth=auth,
)
def get_user(request, user_id: int):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin only"})
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Status(404, {"error": "User not found"})
    return Status(200, _user_to_response(user))


@router.get(
    "/search/",
    response={200: list[UserResponse], 403: ErrorResponse},
    auth=auth,
)
def search_users(request, q: str = ""):
    if not q.strip():
        users = User.objects.all()
    else:
        users = User.objects.filter(username__icontains=q.strip())
    return [_user_to_response(u) for u in users]


@router.delete(
    "/{user_id}",
    response={204: None, 403: ErrorResponse, 404: ErrorResponse},
    auth=auth,
)
def delete_user(request, user_id: int):
    if not _check_admin(request.user):
        return Status(403, {"error": "admin only"})
    try:
        User.objects.get(id=user_id).delete()
    except User.DoesNotExist:
        return Status(404, {"error": "User not found"})
    return Status(204, None)
