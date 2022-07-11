import { useToaster } from "react-hot-toast";

const Toaster = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  return (
    <div
      onMouseEnter={startPause}
      onMouseLeave={endPause}
      style={{
        background: "white",
        position: "fixed",
        margin: "40px 0 0 0",
        left: "50%",
        maxWidth: "100vw",
        transform: "translateX(-50%)",
        fontSize: "24px",
        zIndex: "20",
      }}
    >
      {toasts
        .filter((toast) => toast.visible)
        .map((toast) => {
          const toastMessage = `${toast.message}`;
          const message = toastMessage.split("//")[0];
          const tx = toastMessage.split("//")[1];

          return (
            <div
              key={toast.id}
              {...toast.ariaProps}
              style={{
                background: "#010211",
                color: "#FFFFFF",
                padding: "24px 48px",
                border: "1px solid #15DB95",
                borderRadius: "4px",
                zIndex: "20",
                width: tx ? "830px" : "unset",
                display: "flex",
                alignItems: "center",
                justifyContent: tx ? "space-between" : "center",
              }}
            >
              <h6
                style={{
                  fontSize: "24px",
                  margin: "0",
                  fontWeight: 700,
                  display: "inline",
                }}
              >
                {message}
              </h6>
              {tx ? (
                <a
                  href={`https://rinkeby.etherscan.io/tx/${tx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <h3
                    style={{
                      margin: 0,
                      display: "inline",
                      color: "#15DB95",
                      fontSize: "24px",
                      fontWeight: 700,
                      width: "500px",
                    }}
                  >
                    View on Etherscan
                  </h3>
                </a>
              ) : null}
            </div>
          );
        })}
    </div>
  );
};

export default Toaster;
