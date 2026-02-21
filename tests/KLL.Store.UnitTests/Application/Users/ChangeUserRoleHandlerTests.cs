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

public class ChangeUserRoleHandlerTests
{
    private readonly Mock<IAppUserRepository> _userRepoMock = new();
    private readonly Mock<ILogger<ChangeUserRoleHandler>> _loggerMock = new();
    private readonly ChangeUserRoleHandler _handler;

    public ChangeUserRoleHandlerTests()
    {
        _handler = new ChangeUserRoleHandler(_userRepoMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldChangeRole()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ChangeUserRoleCommand(user.Id, UserRole.Administrador, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Role.Should().Be(UserRole.Administrador);
        _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldReturnError()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((AppUser?)null);

        var result = await _handler.Handle(
            new ChangeUserRoleCommand(Guid.NewGuid(), UserRole.Administrador, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Message.Should().Contain("não encontrado");
    }

    [Fact]
    public async Task Handle_ShouldChangeToTecnico()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ChangeUserRoleCommand(user.Id, UserRole.Tecnico, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Role.Should().Be(UserRole.Tecnico);
    }

    [Fact]
    public async Task Handle_ShouldChangeRoleBackToCliente()
    {
        var user = AppUser.Create("Test", "test@email.com", "12345678900", "hash");
        user.ChangeRole(UserRole.Administrador);
        _userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _handler.Handle(
            new ChangeUserRoleCommand(user.Id, UserRole.Cliente, Guid.NewGuid()), CancellationToken.None);

        result.Success.Should().BeTrue();
        user.Role.Should().Be(UserRole.Cliente);
    }
}
