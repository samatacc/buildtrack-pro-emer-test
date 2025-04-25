"use client";

import { ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "./Card";
import { Text } from "./Text";
import { Heading } from "./Heading";

interface CalculatorInputs {
  projectsPerYear: number;
  teamSize: number;
  avgProjectValue: number;
  currentToolCost: number;
}

interface ROICalculatorProps extends ComponentProps<"div"> {
  className?: string;
  onCalculate?: (results: {
    annualSavings: number;
    timeToROI: number;
    productivityGain: number;
  }) => void;
}

const MONTHLY_COST = 49; // Per user
const TIME_SAVINGS_PERCENT = 0.2; // 20% time savings
const LABOR_COST_PER_HOUR = 50;

export function ROICalculator({
  className = "",
  onCalculate,
  ...props
}: ROICalculatorProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    projectsPerYear: 12,
    teamSize: 5,
    avgProjectValue: 100000,
    currentToolCost: 0,
  });

  const [showResults, setShowResults] = useState(false);

  const calculateROI = () => {
    // Annual cost of BuildTrack Pro
    const annualCost = inputs.teamSize * MONTHLY_COST * 12;

    // Time savings calculations
    const hoursPerProject =
      (inputs.avgProjectValue / LABOR_COST_PER_HOUR) * 0.7; // Assuming 70% of project value is labor
    const totalHoursSaved =
      hoursPerProject * inputs.projectsPerYear * TIME_SAVINGS_PERCENT;
    const annualLaborSavings = totalHoursSaved * LABOR_COST_PER_HOUR;

    // Total savings
    const annualSavings =
      annualLaborSavings + inputs.currentToolCost - annualCost;
    const timeToROI = annualCost / (annualSavings / 12); // in months
    const productivityGain = TIME_SAVINGS_PERCENT * 100; // in percentage

    onCalculate?.({
      annualSavings,
      timeToROI,
      productivityGain,
    });

    setShowResults(true);
  };

  return (
    <Card className={twMerge("max-w-2xl mx-auto", className)} {...props}>
      <Heading level="h3" className="mb-6">
        Calculate Your ROI
      </Heading>

      <div className="space-y-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Projects per Year
            </label>
            <input
              type="number"
              min="1"
              value={inputs.projectsPerYear}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  projectsPerYear: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Size
            </label>
            <input
              type="number"
              min="1"
              value={inputs.teamSize}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  teamSize: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Project Value ($)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.avgProjectValue}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  avgProjectValue: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Tool Costs ($/year)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.currentToolCost}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  currentToolCost: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateROI}
          className="w-full px-6 py-3 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(24,62,105)] transition-colors font-medium"
        >
          Calculate Savings
        </button>

        {/* Results */}
        {showResults && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <Text size="sm" className="text-gray-600">
                  Annual Savings
                </Text>
                <Text size="xl" className="font-bold text-[rgb(24,62,105)]">
                  $
                  {Math.round(
                    inputs.teamSize *
                      inputs.projectsPerYear *
                      inputs.avgProjectValue *
                      TIME_SAVINGS_PERCENT -
                      inputs.teamSize * MONTHLY_COST * 12,
                  ).toLocaleString()}
                </Text>
              </Card>

              <Card className="text-center p-4">
                <Text size="sm" className="text-gray-600">
                  Time to ROI
                </Text>
                <Text size="xl" className="font-bold text-[rgb(24,62,105)]">
                  {Math.round(
                    (inputs.teamSize * MONTHLY_COST * 12) /
                      ((inputs.teamSize *
                        inputs.projectsPerYear *
                        inputs.avgProjectValue *
                        TIME_SAVINGS_PERCENT) /
                        12),
                  )}{" "}
                  months
                </Text>
              </Card>

              <Card className="text-center p-4">
                <Text size="sm" className="text-gray-600">
                  Productivity Gain
                </Text>
                <Text size="xl" className="font-bold text-[rgb(24,62,105)]">
                  {TIME_SAVINGS_PERCENT * 100}%
                </Text>
              </Card>
            </div>

            <Text size="sm" className="text-gray-500 text-center mt-4">
              * Calculations are estimates based on industry averages. Actual
              results may vary.
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
