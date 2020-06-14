function bool(yesNo: string): boolean {
  switch (yesNo) {
    case 'Sí':
    case 'TRUE':
      return true;
    case 'No':
    case 'FALSE':
      return false;
    default:
      throw new Error(`Cannot convert to boolean: ${yesNo}`);
  }
}

export { bool };
