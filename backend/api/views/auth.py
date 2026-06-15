"""Auth views — login/logout."""

from django.contrib.auth import authenticate, login, logout
from ninja import Router, Status

from api.models import UserProfile
from api.schemas import AuthResponse, ErrorResponse, LoginRequest, UserResponse

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
                role="admin" if user.is_staff else "user",
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
