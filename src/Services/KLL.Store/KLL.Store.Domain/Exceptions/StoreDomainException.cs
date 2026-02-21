namespace KLL.Store.Domain.Exceptions;

public class StoreDomainException : Exception
{
    public StoreDomainException(string message) : base(message) { }
}
