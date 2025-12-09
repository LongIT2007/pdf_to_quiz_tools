// Logger utility
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${colors.cyan}ℹ${colors.reset} ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`${colors.green}✓${colors.reset} ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`${colors.yellow}⚠${colors.reset} ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`${colors.red}✗${colors.reset} ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`${colors.dim}🐛${colors.reset} ${message}`, ...args);
    }
  },
};
