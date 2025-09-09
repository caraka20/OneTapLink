import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";  // ✅ ganti .scss → .css

export const showSuccess = (msg: string) => {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: msg,
    timer: 1500,
    showConfirmButton: false,
  });
};

export const showError = (msg: string) => {
  return Swal.fire({
    icon: "error",
    title: "Oops...",
    text: msg,
  });
};

export const showConfirm = async (msg: string) => {
  return Swal.fire({
    title: "Konfirmasi",
    text: msg,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
};
