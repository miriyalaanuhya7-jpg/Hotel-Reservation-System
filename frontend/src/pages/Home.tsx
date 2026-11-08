import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import type {
  DashboardSummary,
  Guest,
  HomeProps,
  Reservation,
  ReservationStatus,
  Room,
  Section,
} from "@/types/hotel";
import {
  DEFAULT_ROOMS,
  deriveReservationStatus,
  sectionPaths,
} from "@/types/hotel";
import {
  GuideModal,
  GuestsSection,
  Header,
  OverviewSection,
  ReportsSection,
  ReservationModal,
  ReservationsSection,
  RoomsSection,
  SettingsModal,
  Sidebar,
} from "@/components/dashboard";

const DEFAULT_SUMMARY: DashboardSummary = {
  occupancy: 38,
  arrivals: 2,
  departures: 2,
  revenue: 8430,
  availableRooms: 8,
  totalRooms: 16,
  occupiedRooms: 6,
};

export default function Home({ initialSection = "Overview" }: HomeProps) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [, setLocation] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [propertyName, setPropertyName] = useState("North House");
  const [headerSearch, setHeaderSearch] = useState("");
  const [prefillRoom, setPrefillRoom] = useState<string | undefined>();
  const [prefillGuest, setPrefillGuest] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  } | null>(null);

  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [toast, setToast] = useState("");
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);
  const [reservationOverrides, setReservationOverrides] = useState<
    Record<number, Reservation>
  >({});
  const [now, setNow] = useState(() => new Date());

  const { data, isLoading } = trpc.hotel.dashboard.useQuery();
  const statusMutation = trpc.hotel.updateReservationStatus.useMutation();

  const [roomOverrides, setRoomOverrides] = useState<
    Record<string, Room["status"]>
  >({});

  const reservations = useMemo(
    () =>
      [
        ...localReservations,
        ...((data?.reservations ?? []) as Reservation[]),
      ].map(item => {
        if (reservationOverrides[item.id]) {
          return reservationOverrides[item.id];
        }
        if (item.status !== "cancelled") {
          return {
            ...item,
            status: deriveReservationStatus(item.checkIn, item.checkOut, now),
          };
        }
        return item;
      }),
    [data?.reservations, localReservations, reservationOverrides, now]
  );
  const rooms = useMemo(() => {
    const baseRooms = (
      data?.rooms?.length ? data.rooms : DEFAULT_ROOMS
    ) as Room[];
    return baseRooms.map(room => {
      // 1. Explicit user or status override
      if (roomOverrides[room.roomNumber]) {
        return { ...room, status: roomOverrides[room.roomNumber] };
      }
      // 2. Active reservation covering today
      const activeCurrentStay = reservations.find(
        r =>
          r.roomNumber === room.roomNumber &&
          (r.status === "checked_in" ||
            (r.status !== "cancelled" &&
              r.status !== "checked_out" &&
              deriveReservationStatus(r.checkIn, r.checkOut, now) ===
                "checked_in"))
      );
      if (activeCurrentStay) {
        return { ...room, status: "occupied" as const };
      }
      return room;
    });
  }, [data?.rooms, roomOverrides, reservations, now]);
  const guests = (data?.guests ?? []) as Guest[];

  const summary: DashboardSummary = useMemo(() => {
    const isSameDay = (d: string | Date | null | undefined) => {
      if (!d) return false;
      const target = new Date(d);
      if (isNaN(target.getTime())) return false;
      const t = new Date();
      if (
        target.getFullYear() === t.getFullYear() &&
        target.getMonth() === t.getMonth() &&
        target.getDate() === t.getDate()
      ) {
        return true;
      }
      try {
        return (
          target.toISOString().slice(0, 10) === t.toISOString().slice(0, 10)
        );
      } catch {
        return false;
      }
    };

    const activeReservations = reservations.filter(
      r => r.status !== "cancelled"
    );
    const arrivals = activeReservations.filter(r =>
      isSameDay(r.checkIn)
    ).length;
    const departures = activeReservations.filter(r =>
      isSameDay(r.checkOut)
    ).length;
    const revenue = activeReservations.reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    );

    const totalRooms = rooms.length || 16;
    const occupied = rooms.filter(r => r.status === "occupied").length;
    const availableRooms = rooms.filter(r => r.status === "available").length;
    const occupancy =
      totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    return {
      occupancy,
      arrivals: arrivals || (data?.summary?.arrivals ?? 0),
      departures: departures || (data?.summary?.departures ?? 0),
      revenue: revenue || (data?.summary?.revenue ?? 0),
      availableRooms,
      totalRooms,
      occupiedRooms: occupied,
    };
  }, [reservations, rooms, data?.summary]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const selectSection = (section: Section) => {
    setActiveSection(section);
    setMobileNavOpen(false);
    setLocation(sectionPaths[section]);
  };

  const handleHeaderSearch = (query: string) => {
    setHeaderSearch(query);
    if (query && activeSection !== "Reservations") {
      setActiveSection("Reservations");
      setLocation(sectionPaths.Reservations);
    }
  };

  const openNewReservation = () => {
    setEditingReservation(null);
    setPrefillRoom(undefined);
    setPrefillGuest(null);
    setModalOpen(true);
  };

  const openNewReservationForRoom = (roomNum: string) => {
    setEditingReservation(null);
    setPrefillRoom(roomNum);
    setPrefillGuest(null);
    setModalOpen(true);
  };

  const openNewReservationForGuest = (guest: Guest) => {
    setEditingReservation(null);
    setPrefillRoom(undefined);
    setPrefillGuest({
      name: guest.name,
      phone: guest.phone ?? undefined,
      email: guest.email ?? undefined,
    });
    setModalOpen(true);
  };

  const openEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setPrefillRoom(undefined);
    setPrefillGuest(null);
    setModalOpen(true);
  };

  const handleUpdateRoomStatus = (
    roomNumber: string,
    status: Room["status"]
  ) => {
    setRoomOverrides(items => ({
      ...items,
      [roomNumber]: status,
    }));
  };

  const handleReservationSave = (reservation: Reservation) => {
    const isTodayStay =
      reservation.status === "checked_in" ||
      deriveReservationStatus(reservation.checkIn, reservation.checkOut, now) ===
        "checked_in";

    if (editingReservation) {
      setReservationOverrides(items => ({
        ...items,
        [reservation.id]: reservation,
      }));
      if (editingReservation.roomNumber !== reservation.roomNumber) {
        setRoomOverrides(items => ({
          ...items,
          [editingReservation.roomNumber]: "available",
          ...(isTodayStay ? { [reservation.roomNumber]: "occupied" } : {}),
        }));
      }
    } else {
      setLocalReservations(items => [reservation, ...items]);
      if (isTodayStay) {
        setRoomOverrides(items => ({
          ...items,
          [reservation.roomNumber]: "occupied",
        }));
      }
    }
    showToast(
      editingReservation
        ? `${reservation.guestName}'s reservation was updated`
        : `${reservation.guestName}'s stay is confirmed`
    );
  };

  const handleStatusChange = async (
    reservation: Reservation,
    status: ReservationStatus
  ) => {
    try {
      await statusMutation.mutateAsync({ id: reservation.id, status });
    } catch {
      /* Keep the UI responsive when demo fallback data is active */
    }
    setReservationOverrides(items => ({
      ...items,
      [reservation.id]: { ...reservation, status },
    }));
    if (status === "checked_out") {
      setRoomOverrides(items => ({
        ...items,
        [reservation.roomNumber]: "cleaning",
      }));
    } else if (status === "cancelled") {
      setRoomOverrides(items => ({
        ...items,
        [reservation.roomNumber]: "available",
      }));
    } else if (status === "checked_in" || status === "confirmed") {
      setRoomOverrides(items => ({
        ...items,
        [reservation.roomNumber]: "occupied",
      }));
    }
    showToast(`${reservation.guestName} is now ${status.replace("_", " ")}`);
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        mobileNavOpen={mobileNavOpen}
        propertyName={propertyName}
        onSelectSection={selectSection}
        onCloseMobileNav={() => setMobileNavOpen(false)}
        onToast={showToast}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
      />

      <main className="main-content">
        <Header
          activeSection={activeSection}
          now={now}
          searchQuery={headerSearch}
          onSearchChange={handleHeaderSearch}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToast={showToast}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="content-wrap">
          {activeSection === "Overview" && (
            <OverviewSection
              summary={summary}
              reservations={reservations}
              onOpenNewReservation={openNewReservation}
              onEditReservation={openEditReservation}
              onStatusChange={handleStatusChange}
              onSelectSection={selectSection}
              onToast={showToast}
            />
          )}

          {activeSection === "Reservations" && (
            <ReservationsSection
              reservations={reservations}
              onOpenNewReservation={openNewReservation}
              onEditReservation={openEditReservation}
              onStatusChange={handleStatusChange}
              onToast={showToast}
            />
          )}

          {activeSection === "Rooms" && (
            <RoomsSection
              summary={summary}
              rooms={rooms}
              onToast={showToast}
              onUpdateRoomStatus={handleUpdateRoomStatus}
              onBookRoom={openNewReservationForRoom}
            />
          )}

          {activeSection === "Guests" && (
            <GuestsSection
              guests={guests}
              onToast={showToast}
              onBookGuest={openNewReservationForGuest}
            />
          )}

          {activeSection === "Reports" && (
            <ReportsSection summary={summary} onToast={showToast} />
          )}
        </div>
      </main>

      {isLoading && <div className="loading-bar" />}

      {modalOpen && (
        <ReservationModal
          reservation={editingReservation}
          rooms={rooms}
          initialRoomNumber={prefillRoom}
          initialGuest={prefillGuest}
          onClose={() => {
            setModalOpen(false);
            setEditingReservation(null);
            setPrefillRoom(undefined);
            setPrefillGuest(null);
          }}
          onSave={handleReservationSave}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          propertyName={propertyName}
          onUpdatePropertyName={name => {
            setPropertyName(name);
            showToast(`Property renamed to ${name}`);
          }}
          onClose={() => setSettingsOpen(false)}
          onToast={showToast}
        />
      )}

      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
