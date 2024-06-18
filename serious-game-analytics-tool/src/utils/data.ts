export const groupAges = (ageCounts: any[]) => {
  if (ageCounts.length === 0) return [];
  const ageRanges = {
    "0-9": 0,
    "10-19": 0,
    "20-29": 0,
    "30-39": 0,
    "40-49": 0,
    "50-59": 0,
    "60-69": 0,
    "70-79": 0,
    "80-89": 0,
    "90-99": 0,
  };

  ageCounts.forEach(({ age, count }) => {
    if (age >= 0 && age < 10) ageRanges["0-9"] += count;
    else if (age < 20) ageRanges["10-19"] += count;
    else if (age < 30) ageRanges["20-29"] += count;
    else if (age < 40) ageRanges["30-39"] += count;
    else if (age < 50) ageRanges["40-49"] += count;
    else if (age < 60) ageRanges["50-59"] += count;
    else if (age < 70) ageRanges["60-69"] += count;
    else if (age < 80) ageRanges["70-79"] += count;
    else if (age < 90) ageRanges["80-89"] += count;
    else if (age < 100) ageRanges["90-99"] += count;
  });

  return Object.keys(ageRanges).map((range) => ({
    ageRange: range,
    count: (ageRanges as any)[range],
  }));
};
