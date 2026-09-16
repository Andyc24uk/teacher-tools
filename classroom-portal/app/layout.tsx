import './globals.css';
export const metadata = { title: 'Classroom Portal', description: 'Low-friction school-mode access to classroom work.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
