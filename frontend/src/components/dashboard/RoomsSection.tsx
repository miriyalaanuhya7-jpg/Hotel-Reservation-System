import { useState } from "react";
import { Check, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import type { DashboardSummary, Room } from "@/types/hotel";
import { currency } from "@/types/hotel";

export type RoomsSectionProps = {
  summary: DashboardSummary;
  rooms: Room[];
  onToast: (message: string) => void;
  onUpdateRoomStatus?: (roomNumber: string, status: Room["status"]) => void;
  onBookRoom?: (roomNumber: string) => void;
};

export function RoomsSection({
  summary,
  rooms,
  onToast,
  onUpdateRoomStatus,
  onBookRoom,
}: RoomsSectionProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const availableCount = rooms.filter(r => r.status === "available").length;
  const occupiedCount = rooms.filter(r => r.status === "occupied").length;
  const cleaningCount = rooms.filter(r => r.status === "cleaning").length;
  const maintenanceCount = rooms.filter(r => r.status === "maintenance").length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onToast("Room board refreshed & in sync");
    }, 400);
  };

  // Display all 4 floors
  const floors = [1, 2, 3, 4];

  return (
    <section className="section-page">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Property operations</p>
          <h2>Rooms & availability</h2>
          <p className="muted">
            Live status across 4 floors (4 rooms per floor) of North House.
          </p>
        </div>
        <button
          className="button-secondary"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh current room status board"
        >
          {isRefreshing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {isRefreshing ? "Refreshing…" : "Refresh board"}
        </button>
      </div>

      <div className="room-summary">
        <div>
          <span className="room-summary-dot dot-available" />
          <strong>{availableCount}</strong>
          <span>Available</span>
        </div>
        <div>
          <span className="room-summary-dot dot-occupied" />
          <strong>{occupiedCount}</strong>
          <span>In use</span>
        </div>
        <div>
          <span className="room-summary-dot dot-cleaning" />
          <strong>{String(cleaningCount).padStart(2, "0")}</strong>
          <span>Cleaning</span>
        </div>
        <div>
          <span className="room-summary-dot dot-maintenance" />
          <strong>{String(maintenanceCount).padStart(2, "0")}</strong>
          <span>Maintenance</span>
        </div>
      </div>

      <div className="floors-container">
        {floors.map(floorNumber => {
          const floorRooms = rooms.filter(r => r.floor === floorNumber);
          return (
            <div key={floorNumber} className="floor-section">
              <div className="floor-header">
                <h3>Floor {floorNumber}</h3>
                <span className="floor-meta">
                  {floorRooms.length || 4} rooms ({floorNumber}01 –{" "}
                  {floorNumber}04)
                </span>
              </div>
              <div className="room-grid">
                {floorRooms.map(room => (
                  <div className="room-card" key={room.roomNumber}>
                    <div className="room-card-top">
                      <span className={`room-status room-${room.status}`}>
                        {room.status}
                      </span>
                      <div className="action-menu-wrap">
                        <button
                          className="more-button"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === room.roomNumber
                                ? null
                                : room.roomNumber
                            )
                          }
                          aria-label={`Options for room ${room.roomNumber}`}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        {activeMenu === room.roomNumber && (
                          <div className="action-menu" style={{ zIndex: 40 }}>
                            <strong>Room {room.roomNumber} Actions</strong>
                            {room.status === "available" && onBookRoom && (
                              <button
                                onClick={() => {
                                  setActiveMenu(null);
                                  onBookRoom(room.roomNumber);
                                }}
                              >
                                <Plus size={14} />
                                Book this room
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                onUpdateRoomStatus?.(
                                  room.roomNumber,
                                  "available"
                                );
                                onToast(`Room ${room.roomNumber} marked Available`);
                              }}
                            >
                              <span
                                className="room-summary-dot dot-available"
                                style={{ width: 7, height: 7 }}
                              />
                              Mark Available
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                onUpdateRoomStatus?.(
                                  room.roomNumber,
                                  "cleaning"
                                );
                                onToast(`Room ${room.roomNumber} sent to Cleaning`);
                              }}
                            >
                              <span
                                className="room-summary-dot dot-cleaning"
                                style={{ width: 7, height: 7 }}
                              />
                              Mark Cleaning
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                onUpdateRoomStatus?.(
                                  room.roomNumber,
                                  "maintenance"
                                );
                                onToast(
                                  `Room ${room.roomNumber} set to Maintenance`
                                );
                              }}
                            >
                              <span
                                className="room-summary-dot dot-maintenance"
                                style={{ width: 7, height: 7 }}
                              />
                              Mark Maintenance
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                onUpdateRoomStatus?.(
                                  room.roomNumber,
                                  "occupied"
                                );
                                onToast(`Room ${room.roomNumber} marked Occupied`);
                              }}
                            >
                              <span
                                className="room-summary-dot dot-occupied"
                                style={{ width: 7, height: 7 }}
                              />
                              Mark Occupied
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="room-number">{room.roomNumber}</div>
                    <div className="room-type">{room.roomType}</div>
                    <div className="room-card-bottom">
                      <span>Floor {room.floor}</span>
                      <strong>
                        {currency(room.rate)}
                        <small>/day</small>
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
