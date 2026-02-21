namespace KLL.Store.Application.Options;

public class BackblazeB2Options
{
    public const string Section = "BackblazeB2";
    public string BucketName { get; set; } = string.Empty;
    public string KeyId { get; set; } = string.Empty;
    public string ApplicationKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}
