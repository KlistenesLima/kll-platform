using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Pay.Domain.Entities;

public class Merchant : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Document { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? WebhookUrl { get; private set; }
    public string ApiKey { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    private Merchant() { }

    public static Merchant Create(string name, string document, string email, string? webhookUrl)
    {
        return new Merchant
        {
            Name = name, Document = document, Email = email,
            WebhookUrl = webhookUrl, ApiKey = $"kll_pk_{Guid.NewGuid():N}"
        };
    }

    public void Update(string name, string email, string? webhookUrl)
    { Name = name; Email = email; WebhookUrl = webhookUrl; SetUpdated(); }

    public void Deactivate() { IsActive = false; SetUpdated(); }
}