using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class UserProfile : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;

    private UserProfile() { }

    public static UserProfile Create(string customerId, string firstName, string lastName)
    {
        return new UserProfile
        {
            CustomerId = customerId,
            FirstName = firstName,
            LastName = lastName
        };
    }

    public void Update(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
        SetUpdated();
    }

    public void SetAvatar(string avatarUrl)
    {
        AvatarUrl = avatarUrl;
        SetUpdated();
    }
}
