using FluentAssertions;
using KLL.Store.Application.Commands.Users;
using KLL.Store.Application.Commands.Users.Handlers;
using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Exceptions;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KLL.Store.UnitTests.Application.Users;

public class ApproveUserHandlerTests
{
    private readonly Mock<IAppUserRepository> _userRepoMock = new();
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<ILogger<ApproveUserHandler>> _loggerMock = new();
    private readonly ApproveUserHandler _handler;

    public ApproveUserHandlerTests()
    {
        _handler = new ApproveUserHandler(_userRepoMock.Object, _emailServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldReturnError()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((AppUser?)null);

        var result = await _handler.Handle(
            new ApproveUserCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("não encontrado");
    }

    [Fact]
    public async Task Handle_WhenNotPending_ShouldThrow()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        // user is PendingEmailConfirmation, not PendingApproval
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var act = async () => await _handler.Handle(
            new ApproveUserCommand(user.Id, Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<StoreDomainException>();
    }

    [Fact]
    public async Task Handle_WhenValid_ShouldApproveUser()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        user.ConfirmEmail();
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ApproveUserCommand(user.Id, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Status.Should().Be(UserStatus.Active);
        _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_ShouldSendApprovalEmail()
    {
        var user = AppUser.Create("Test User", "test@email.com", "12345678900", "hash");
        user.ConfirmEmail();
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        await _handler.Handle(new ApproveUserCommand(user.Id, Guid.NewGuid()), CancellationToken.None);

        _emailServiceMock.Verify(e => e.SendApprovalNotificationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_ShouldSetApprovedAtAndApprovedBy()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        user.ConfirmEmail();
        var adminId = Guid.NewGuid();
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var before = DateTime.UtcNow;
        await _handler.Handle(new ApproveUserCommand(user.Id, adminId), CancellationToken.None);

        user.ApprovedAt.Should().NotBeNull();
        user.ApprovedAt.Should().BeOnOrAfter(before);
        user.ApprovedBy.Should().Be(adminId.ToString());
    }
}
