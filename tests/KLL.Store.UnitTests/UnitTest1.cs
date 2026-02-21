using FluentAssertions;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Exceptions;
using Xunit;

namespace KLL.Store.UnitTests;

public class FavoriteDomainTests
{
    [Fact]
    public void Create_ShouldSetCustomerIdAndProductId()
    {
        var productId = Guid.NewGuid();
        var favorite = Favorite.Create("user-123", productId);

        favorite.CustomerId.Should().Be("user-123");
        favorite.ProductId.Should().Be(productId);
        favorite.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_DifferentProducts_ShouldHaveDifferentIds()
    {
        var fav1 = Favorite.Create("user-1", Guid.NewGuid());
        var fav2 = Favorite.Create("user-1", Guid.NewGuid());

        fav1.Id.Should().NotBe(fav2.Id);
        fav1.ProductId.Should().NotBe(fav2.ProductId);
    }

    [Fact]
    public void Create_ShouldSetCreatedAt()
    {
        var before = DateTime.UtcNow;
        var favorite = Favorite.Create("user-1", Guid.NewGuid());

        favorite.CreatedAt.Should().BeOnOrAfter(before);
    }
}

public class CustomerAddressDomainTests
{
    [Fact]
    public void Create_ShouldSetAllFields()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", "Apto 4",
            "Centro", "Recife", "PE", "50000-000");

        addr.CustomerId.Should().Be("user-1");
        addr.Label.Should().Be("Casa");
        addr.Street.Should().Be("Rua A");
        addr.Number.Should().Be("123");
        addr.Complement.Should().Be("Apto 4");
        addr.Neighborhood.Should().Be("Centro");
        addr.City.Should().Be("Recife");
        addr.State.Should().Be("PE");
        addr.ZipCode.Should().Be("50000-000");
        addr.IsDefault.Should().BeFalse();
        addr.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_WithoutComplement_ShouldAllowNull()
    {
        var addr = CustomerAddress.Create("user-1", "Trabalho", "Rua B", "456", null,
            "Boa Viagem", "Recife", "PE", "51000-000");

        addr.Complement.Should().BeNull();
        addr.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Update_ShouldChangeFields()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");

        addr.Update("Trabalho", "Rua Nova", "789", "Sala 2", "Boa Viagem", "Recife", "PE", "51000-000");

        addr.Label.Should().Be("Trabalho");
        addr.Street.Should().Be("Rua Nova");
        addr.Number.Should().Be("789");
        addr.Complement.Should().Be("Sala 2");
        addr.Neighborhood.Should().Be("Boa Viagem");
    }

    [Fact]
    public void SetAsDefault_ShouldSetTrue()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");

        addr.SetAsDefault();

        addr.IsDefault.Should().BeTrue();
    }

    [Fact]
    public void UnsetDefault_ShouldSetFalse()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");
        addr.SetAsDefault();

        addr.UnsetDefault();

        addr.IsDefault.Should().BeFalse();
    }
}

public class AppUserDomainTests
{
    private AppUser CreateTestUser() =>
        AppUser.Create("João Silva", "joao@test.com", "123.456.789-00", "hashed_password");

    [Fact]
    public void Create_ShouldSetDefaultValues()
    {
        var user = CreateTestUser();

        user.Id.Should().NotBeEmpty();
        user.FullName.Should().Be("João Silva");
        user.Email.Should().Be("joao@test.com");
        user.Document.Should().Be("12345678900");
        user.PasswordHash.Should().Be("hashed_password");
        user.Role.Should().Be(UserRole.Cliente);
        user.Status.Should().Be(UserStatus.PendingEmailConfirmation);
        user.EmailConfirmationCode.Should().NotBeNullOrEmpty();
        user.EmailConfirmationCode!.Length.Should().Be(6);
        user.EmailConfirmationExpiry.Should().NotBeNull();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Create_ShouldNormalizeEmail()
    {
        var user = AppUser.Create("Test", "JOAO@TEST.COM", "111.222.333-44", "hash");
        user.Email.Should().Be("joao@test.com");
    }

    [Fact]
    public void Create_ShouldCleanDocument()
    {
        var user = AppUser.Create("Test", "a@b.com", "111.222.333-44", "hash");
        user.Document.Should().Be("11122233344");
    }

    [Fact]
    public void ConfirmEmail_ShouldTransitionToPendingApproval()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();

        user.Status.Should().Be(UserStatus.PendingApproval);
        user.EmailConfirmationCode.Should().BeNull();
        user.EmailConfirmationExpiry.Should().BeNull();
    }

    [Fact]
    public void ConfirmEmail_WhenAlreadyConfirmed_ShouldThrow()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();

        var act = () => user.ConfirmEmail();
        act.Should().Throw<StoreDomainException>()
            .WithMessage("*Email já confirmado*");
    }

    [Fact]
    public void Approve_ShouldTransitionToActive()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();
        user.Approve("admin-123");

        user.Status.Should().Be(UserStatus.Active);
        user.ApprovedAt.Should().NotBeNull();
        user.ApprovedBy.Should().Be("admin-123");
    }

    [Fact]
    public void Approve_WhenNotPendingApproval_ShouldThrow()
    {
        var user = CreateTestUser(); // Status = PendingEmailConfirmation

        var act = () => user.Approve("admin-123");
        act.Should().Throw<StoreDomainException>()
            .WithMessage("*não está pendente de aprovação*");
    }

    [Fact]
    public void Reject_ShouldSetRejectedStatus()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();
        user.Reject("admin-123");

        user.Status.Should().Be(UserStatus.Rejected);
        user.ApprovedBy.Should().Be("admin-123");
    }

    [Fact]
    public void Activate_ShouldSetActive()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();
        user.Approve("admin");
        user.Deactivate();

        user.Activate();

        user.Status.Should().Be(UserStatus.Active);
    }

    [Fact]
    public void Deactivate_ShouldSetInactive()
    {
        var user = CreateTestUser();
        user.ConfirmEmail();
        user.Approve("admin");

        user.Deactivate();

        user.Status.Should().Be(UserStatus.Inactive);
    }

    [Fact]
    public void ChangeRole_ShouldUpdateRole()
    {
        var user = CreateTestUser();

        user.ChangeRole(UserRole.Administrador);

        user.Role.Should().Be(UserRole.Administrador);
    }

    [Fact]
    public void ChangeRole_ToTecnico_ShouldUpdateRole()
    {
        var user = CreateTestUser();

        user.ChangeRole(UserRole.Tecnico);

        user.Role.Should().Be(UserRole.Tecnico);
    }

    [Fact]
    public void SetPasswordResetCode_ShouldGenerateCode()
    {
        var user = CreateTestUser();

        user.SetPasswordResetCode();

        user.PasswordResetCode.Should().NotBeNullOrEmpty();
        user.PasswordResetCode!.Length.Should().Be(6);
        user.PasswordResetExpiry.Should().NotBeNull();
        user.PasswordResetExpiry.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void ResetPassword_ShouldUpdateHashAndClearCode()
    {
        var user = CreateTestUser();
        user.SetPasswordResetCode();

        user.ResetPassword("new_hash");

        user.PasswordHash.Should().Be("new_hash");
        user.PasswordResetCode.Should().BeNull();
        user.PasswordResetExpiry.Should().BeNull();
    }

    [Fact]
    public void GenerateNewEmailConfirmationCode_ShouldRefreshCode()
    {
        var user = CreateTestUser();
        var oldCode = user.EmailConfirmationCode;

        user.GenerateNewEmailConfirmationCode();

        user.EmailConfirmationCode.Should().NotBeNullOrEmpty();
        user.EmailConfirmationExpiry.Should().NotBeNull();
        // Code is random, might be same but expiry should be refreshed
        user.EmailConfirmationExpiry.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void FullWorkflow_Register_Confirm_Approve_ShouldWork()
    {
        var user = AppUser.Create("Maria Santos", "maria@test.com", "98765432100", "hash");
        user.Status.Should().Be(UserStatus.PendingEmailConfirmation);

        user.ConfirmEmail();
        user.Status.Should().Be(UserStatus.PendingApproval);

        user.Approve("admin-1");
        user.Status.Should().Be(UserStatus.Active);
        user.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void FullWorkflow_Register_Confirm_Reject_ShouldWork()
    {
        var user = AppUser.Create("Carlos Lima", "carlos@test.com", "11122233344", "hash");

        user.ConfirmEmail();
        user.Reject("admin-1");

        user.Status.Should().Be(UserStatus.Rejected);
    }
}

public class AdditionalShippingTests
{
    private readonly KLL.Store.Application.Services.ShippingService _sut = new();

    [Fact]
    public void Calculate_RJCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("20000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(20m);
        result.Options[0].MinDays.Should().Be(5);
        result.Options[0].MaxDays.Should().Be(8);
    }

    [Fact]
    public void Calculate_MGCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("30000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(18m);
    }

    [Fact]
    public void Calculate_DFCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("70000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(20m);
    }

    [Fact]
    public void Calculate_AMCep_ShouldReturnHighestPrice()
    {
        var result = _sut.Calculate("69000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(40m);
        result.Options[0].MinDays.Should().Be(10);
        result.Options[0].MaxDays.Should().Be(14);
    }

    [Fact]
    public void Calculate_RSCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("90000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(22m);
    }

    [Fact]
    public void Calculate_EmptyCep_ShouldReturnError()
    {
        var result = _sut.Calculate("", 100m);

        result.Valid.Should().BeFalse();
        result.Error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Calculate_LettersInCep_ShouldReturnError()
    {
        var result = _sut.Calculate("ABCDE-FGH", 100m);

        result.Valid.Should().BeFalse();
    }
}
