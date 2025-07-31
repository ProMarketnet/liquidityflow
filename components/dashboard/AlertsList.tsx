interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info'; // Explicit union type
  title: string;
  description: string;
  time: string;
}
