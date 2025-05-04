export class ConvertStringToDate {
  public static stringToDate(dateString: string): Date {
    if (!dateString) return new Date();

    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Format should be 'DD-MM-YYYY'
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }

    return new Date();
  }
}
