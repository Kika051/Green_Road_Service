import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileDown, Loader2, X } from "lucide-react";
import { useBookings, useInvoice } from "../hooks";
import { BookingCard, Button } from "../components";
import { BOOKING_STATUS } from "../utils/constants";

const DriverDashboard = () => {
  const { t } = useTranslation();
  const {
    bookings,
    loading,
    acceptBooking,
    refuseBooking,
    cancelBooking,
    filterByStatus,
  } = useBookings();
  const { downloadBonCommande } = useInvoice();
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (bookingId) => {
    if (!window.confirm(t("dashboard.confirmAccept"))) return;
    setProcessingId(bookingId);
    const result = await acceptBooking(bookingId);
    alert(
      result.success
        ? t("dashboard.alerts.acceptSuccess")
        : t("dashboard.alerts.acceptError")
    );
    setProcessingId(null);
  };

  const handleRefuse = async (bookingId) => {
    if (!window.confirm(t("dashboard.confirmRefuse"))) return;
    const reason = window.prompt(
      t("dashboard.refuseReason"),
      "Indisponibilité"
    );
    setProcessingId(bookingId);
    const result = await refuseBooking(bookingId, reason);
    alert(
      result.success
        ? t("dashboard.alerts.refuseSuccess")
        : t("dashboard.alerts.refuseError")
    );
    setProcessingId(null);
  };

  const handleCancelByDriver = async (booking) => {
    if (!window.confirm(t("dashboard.cancel.confirmMessage"))) return;

    const reason = window.prompt(t("dashboard.cancel.reasonPrompt"), "");
    setProcessingId(booking.id);

    const result = await cancelBooking(booking.id, "driver", reason);

    if (result.success) {
      alert(t("dashboard.cancel.success"));
    } else {
      alert(t("dashboard.cancel.error"));
    }
    setProcessingId(null);
  };

  const sections = [
    {
      status: BOOKING_STATUS.PENDING,
      title: t("dashboard.sections.pending"),
      emoji: "🟡",
      showActions: true,
    },
    {
      status: BOOKING_STATUS.ACCEPTED,
      title: t("dashboard.sections.accepted"),
      emoji: "🔵",
      showCancel: true,
    },
    {
      status: BOOKING_STATUS.PAID,
      title: t("dashboard.sections.confirmed"),
      emoji: "🟢",
      showBon: true,
      showCancel: true,
    },
    {
      status: "annulee",
      title: t("dashboard.sections.cancelled"),
      emoji: "🟠",
    },
    {
      status: BOOKING_STATUS.REFUSED,
      title: t("dashboard.sections.refused"),
      emoji: "🔴",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("dashboard.title")}</h1>

      {sections.map(
        ({ status, title, emoji, showActions, showBon, showCancel }) => {
          const rides = filterByStatus(status);

          return (
            <div key={status} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {emoji} {title}{" "}
                <span className="text-sm text-zinc-400">({rides.length})</span>
              </h2>

              {rides.length === 0 ? (
                <p className="text-zinc-400">{t("dashboard.noRides")}</p>
              ) : (
                <div className="space-y-4">
                  {rides.map((ride) => (
                    <BookingCard
                      key={ride.id}
                      booking={ride}
                      showClientInfo
                      actions={
                        <div className="flex flex-col gap-2">
                          {showActions && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAccept(ride.id)}
                                loading={processingId === ride.id}
                              >
                                {t("dashboard.accept")}
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleRefuse(ride.id)}
                                disabled={processingId === ride.id}
                              >
                                {t("dashboard.refuse")}
                              </Button>
                            </div>
                          )}
                          {showBon && (
                            <Button
                              variant="secondary"
                              onClick={() => downloadBonCommande(ride)}
                              icon={FileDown}
                            >
                              {t("dashboard.orderForm")}
                            </Button>
                          )}
                          {showCancel && (
                            <Button
                              variant="danger"
                              onClick={() => handleCancelByDriver(ride)}
                              icon={X}
                              size="sm"
                              disabled={processingId === ride.id}
                            >
                              {t("dashboard.cancel.button")}
                            </Button>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

export default DriverDashboard;
