export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  export const generateTicketId = (): string => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000);
    return `AVT-${timestamp}-${random}`;
  };