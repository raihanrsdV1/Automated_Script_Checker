import { toast } from "react-toastify";

// Toast utility functions
export const showToast = (message, type) => {
  console.log(message, type);
  if (type === "success") toast.success(message, {});
  else if (type === "error") toast.error(message, {});
  else {
    toast.dark(message, {});
  }
};

// Export showToast2 as an alias of showToast to fix import errors
export const showToast2 = showToast;