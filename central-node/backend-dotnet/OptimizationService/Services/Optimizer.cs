namespace OptimizationService.Services;

public record OptimizationInput(double ResourceA, double ResourceB, double TargetOutput);
public record OptimizationResult(double AllocationA, double AllocationB, double Efficiency, string Status);

public interface IOptimizer
{
    OptimizationResult OptimizeResources(OptimizationInput input);
}

public class Optimizer : IOptimizer
{
    public OptimizationResult OptimizeResources(OptimizationInput input)
    {
        // Simple dummy optimization logic
        // Try to balance ResourceA and ResourceB to meet TargetOutput
        
        double totalResources = input.ResourceA + input.ResourceB;
        if (totalResources == 0) return new OptimizationResult(0, 0, 0, "No resources provided");

        double ratioA = input.ResourceA / totalResources;
        double ratioB = input.ResourceB / totalResources;

        // "Optimized" allocation matches the ratio but scaled to target if possible
        // This is just a placeholder for complex logic (Linear Programming, etc.)
        
        double optimizedA = input.TargetOutput * ratioA;
        double optimizedB = input.TargetOutput * ratioB;

        return new OptimizationResult(optimizedA, optimizedB, 0.95, "Optimized based on ratio allocation");
    }
}
