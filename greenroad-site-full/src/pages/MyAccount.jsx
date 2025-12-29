import { useTranslation } from "react-i18next";
import {
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  FileDown,
  X,
} from "lucide-react";
import { useAuth, useBookings, useInvoice } from "../hooks";
import { BookingCard, Button } from "../components";

const MyAccount = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    bookings,
    loading,
    generatePaymentLink,
    cancelBooking,
    filterByStatus,
  } = useBookings(user?.uid);
  const { downloadInvoice } = useInvoice();

  const handlePayment = async (bookingId) => {
    const result = await generatePaymentLink(bookingId);
    if (result.success && result.data.checkoutUrl) {
      window.location.href = result.data.checkoutUrl;
    } else {
      alert("Erreur lors de la génération du lien de paiement.");
    }
  };

  const handleCancel = async (booking) => {
    // Calculer le délai avant la course
    const bookingDate = booking.datetime?.toDate
      ? booking.datetime.toDate()
      : new Date(booking.datetime || booking.date);
    const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60);

    let confirmMessage = t("account.cancel.confirmMessage");

    if (booking.status === "payee" && hoursUntilBooking < 5) {
      confirmMessage = t("account.cancel.confirmWithFees");
    }

    if (!window.confirm(confirmMessage)) return;

    const reason = window.prompt(t("account.cancel.reasonPrompt"), "");

    const result = await cancelBooking(booking.id, "client", reason);

    if (result.success) {
      let message = t("account.cancel.success");
      if (result.data.refundStatus === "partial") {
        message += ` ${t("account.cancel.partialRefund", {
          fee: result.data.cancellationFee,
          refund: result.data.refundAmount,
        })}`;
      } else if (result.data.refundStatus === "full") {
        message += ` ${t("account.cancel.fullRefund", {
          refund: result.data.refundAmount,
        })}`;
      }
      alert(message);
    } else {
      alert(t("account.cancel.error"));
    }
  };

  const sections = [
    {
      status: "en_attente",
      title: t("account.sections.pending"),
      icon: Clock,
      color: "text-yellow-500",
      showCancel: true,
    },
    {
      status: "acceptee",
      title: t("account.sections.accepted"),
      icon: CheckCircle,
      color: "text-blue-500",
      showPay: true,
      showCancel: true,
    },
    {
      status: "payee",
      title: t("account.sections.confirmed"),
      icon: CheckCircle,
      color: "text-green-500",
      showInvoice: true,
      showCancel: true,
    },
    {
      status: "annulee",
      title: t("account.sections.cancelled"),
      icon: XCircle,
      color: "text-orange-500",
    },
    {
      status: "refuse",
      title: t("account.sections.refused"),
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Chargement...
      </div>
    );

  return (
    <div className="min-h-screen p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t("account.title")}</h2>

      {bookings.length === 0 ? (
        <p className="text-zinc-400">{t("account.noBookings")}</p>
      ) : (
        <div className="space-y-8">
          {sections.map(
            ({
              status,
              title,
              icon: Icon,
              color,
              showPay,
              showInvoice,
              showCancel,
            }) => {
              const sectionBookings = filterByStatus(status);
              if (sectionBookings.length === 0) return null;

              return (
                <div key={status}>
                  <h3
                    className={`text-xl font-semibold mb-3 flex items-center ${color}`}
                  >
                    <Icon className="mr-2" size={20} />
                    {title}{" "}
                    <span className="ml-2 text-sm text-zinc-400">
                      ({sectionBookings.length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {sectionBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        actions={
                          <div className="flex flex-col gap-2">
                            {showPay && (
                              <Button
                                onClick={() => handlePayment(booking.id)}
                                icon={CreditCard}
                              >
                                {t("account.pay")}
                              </Button>
                            )}
                            {showInvoice && (
                              <Button
                                variant="secondary"
                                onClick={() => downloadInvoice(booking, user)}
                                icon={FileDown}
                              >
                                {t("account.invoice")}
                              </Button>
                            )}
                            {showCancel && (
                              <Button
                                variant="danger"
                                onClick={() => handleCancel(booking)}
                                icon={X}
                                size="sm"
                              >
                                {t("account.cancel.button")}
                              </Button>
                            )}
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default MyAccount;
