using FluentAssertions;
using KLL.Store.Application.Commands.Users;
using KLL.Store.Application.Commands.Users.Handlers;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KLL.Store.UnitTests.Application.Users;

public class ChangeUserStatusHandlerTests
{
    private readonly Mock<IAppUserRepository> _userRepoMock = new();
    private readonly Mock<ILogger<ChangeUserStatusHandler>> _loggerMock = new();
    private readonly ChangeUserStatusHandler _handler;

    public ChangeUserStatusHandlerTests()
    {
        _handler = new ChangeUserStatusHandler(_userRepoMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WhenActivate_ShouldSetActive()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ChangeUserStatusCommand(user.Id, true, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Status.Should().Be(UserStatus.Active);
        result.Message.Should().Contain("ativado");
        _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenDeactivate_ShouldSetInactive()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ChangeUserStatusCommand(user.Id, false, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Status.Should().Be(UserStatus.Inactive);
        result.Message.Should().Contain("desativado");
        _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldReturnError()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((AppUser?)null);

        var result = await _handler.Handle(
            new ChangeUserStatusCommand(Guid.NewGuid(), true, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("não encontrado");
    }
}
