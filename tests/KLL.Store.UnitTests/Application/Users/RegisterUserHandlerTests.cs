using FluentAssertions;
using KLL.Store.Application.Commands.Users;
using KLL.Store.Application.Commands.Users.Handlers;
using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KLL.Store.UnitTests.Application.Users;

public class RegisterUserHandlerTests
{
    private readonly Mock<IAppUserRepository> _userRepoMock = new();
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<ILogger<RegisterUserHandler>> _loggerMock = new();
    private readonly RegisterUserHandler _handler;

    public RegisterUserHandlerTests()
    {
        _handler = new RegisterUserHandler(_userRepoMock.Object, _emailServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WhenEmailAlreadyExists_ShouldReturnError()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(AppUser.Create("Existing", "test@email.com", "12345678900", "hash"));

        var command = new RegisterUserCommand("Test User", "test@email.com", "98765432100", "Senha123");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Email já cadastrado");
    }

    [Fact]
    public async Task Handle_WhenDocumentAlreadyExists_ShouldReturnError()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);
        _userRepoMock.Setup(r => r.GetByDocumentAsync(It.IsAny<string>()))
            .ReturnsAsync(AppUser.Create("Existing", "other@email.com", "12345678900", "hash"));

        var command = new RegisterUserCommand("Test User", "new@email.com", "12345678900", "Senha123");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("CPF já cadastrado");
    }

    [Fact]
    public async Task Handle_WhenValid_ShouldCreateUser()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);
        _userRepoMock.Setup(r => r.GetByDocumentAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);

        var command = new RegisterUserCommand("Test User", "test@email.com", "12345678900", "Senha123");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Success.Should().BeTrue();
        result.UserId.Should().NotBeNull();
        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<AppUser>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_ShouldSendConfirmationEmail()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);
        _userRepoMock.Setup(r => r.GetByDocumentAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);

        var command = new RegisterUserCommand("Test User", "test@email.com", "12345678900", "Senha123");
        await _handler.Handle(command, CancellationToken.None);

        _emailServiceMock.Verify(e => e.SendEmailConfirmationAsync(
            "test@email.com", "Test User", It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldHashPassword()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);
        _userRepoMock.Setup(r => r.GetByDocumentAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);

        AppUser? capturedUser = null;
        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<AppUser>()))
            .Callback<AppUser>(u => capturedUser = u);

        var command = new RegisterUserCommand("Test User", "test@email.com", "12345678900", "Senha123");
        await _handler.Handle(command, CancellationToken.None);

        capturedUser.Should().NotBeNull();
        capturedUser!.PasswordHash.Should().NotBe("Senha123");
        BCrypt.Net.BCrypt.Verify("Senha123", capturedUser.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ShouldSetStatusToPendingEmailConfirmation()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);
        _userRepoMock.Setup(r => r.GetByDocumentAsync(It.IsAny<string>())).ReturnsAsync((AppUser?)null);

        AppUser? capturedUser = null;
        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<AppUser>()))
            .Callback<AppUser>(u => capturedUser = u);

        var command = new RegisterUserCommand("Test User", "test@email.com", "12345678900", "Senha123");
        await _handler.Handle(command, CancellationToken.None);

        capturedUser.Should().NotBeNull();
        capturedUser!.Status.Should().Be(UserStatus.PendingEmailConfirmation);
    }
}
