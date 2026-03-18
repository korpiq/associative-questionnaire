export function readTargetNameArgument(argv: string[], defaultTargetName: string): string {
  return argv[2] || defaultTargetName
}
