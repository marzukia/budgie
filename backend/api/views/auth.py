"""Auth views — login/logout."""

from django.contrib.auth import authenticate, login, logout
from ninja import Router, Status

from api.models import UserProfile
from api.schemas import AuthResponse, ErrorResponse, LoginRequest, UserResponse


def _get_role(user) -> str:
    """Return 'admin' or 'user' based on admin status.

    Currently delegates to Django's is_staff flag. Change this
    single point to switch to group/permission-based checks.
    """
    return "admin" if user.is_staff else "user"


def _check_admin(user) -> bool:
    """Check if user has admin privileges.

    Currently delegates to is_staff. Single point to switch to
    group/permission-based checks when authorization evolves.
    """
    return user.is_staff

router = Router(tags=["auth"])


@router.post("/login", response={200: AuthResponse, 401: ErrorResponse})
def login_view(request, body: LoginRequest):
    user = authenticate(request, username=body.username, password=body.password)
    if user is None:
        return Status(401, {"error": "invalid credentials"})

    login(request, user)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.login_count += 1
    profile.save()

    return Status(
        200,
        AuthResponse(
            user=UserResponse(
                id=user.id,
                name=user.username,
                role=_get_role(user),
                last_login_at=user.last_login,
                login_count=profile.login_count,
                created_at=user.date_joined,
            ),
        ),
    )


@router.post("/logout", response={200: None})
def logout_view(request):
    logout(request)
    return Status(200, None)


@router.get("/me", response={200: AuthResponse, 401: ErrorResponse})
def me_view(request):
    user = request.user
    if user.is_anonymous:
        return Status(401, {"error": "not authenticated"})

    profile = UserProfile.objects.filter(user=user).first()
    return Status(
        200,
        AuthResponse(
            user=UserResponse(
                id=user.id,
                name=user.username,
                role=_get_role(user),
                last_login_at=user.last_login,
                login_count=profile.login_count if profile else 0,
                created_at=user.date_joined,
            ),
        ),
    )
