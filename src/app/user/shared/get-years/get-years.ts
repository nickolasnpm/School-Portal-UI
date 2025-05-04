export class GetYears {
  public static getYears() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear;
    const nextYear = currentYear + 6;

    return Array.from(
      { length: nextYear - previousYear },
      (_, index) => previousYear + index
    );
  }
}
