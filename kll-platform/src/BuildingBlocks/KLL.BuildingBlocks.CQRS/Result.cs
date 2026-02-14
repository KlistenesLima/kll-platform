namespace KLL.BuildingBlocks.CQRS;

public class Result<T>
{
    public T? Value { get; }
    public bool IsSuccess { get; }
    public string? Error { get; }
    public int StatusCode { get; }

    private Result(T value) { Value = value; IsSuccess = true; StatusCode = 200; }
    private Result(string error, int statusCode) { Error = error; IsSuccess = false; StatusCode = statusCode; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error, int statusCode = 400) => new(error, statusCode);
    public static Result<T> NotFound(string error = "Resource not found") => new(error, 404);
    public static Result<T> Conflict(string error = "Resource already exists") => new(error, 409);

    public static implicit operator Result<T>(T value) => Success(value);
}