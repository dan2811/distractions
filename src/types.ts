export type Role = "client" | "musician" | "admin" | "superAdmin";
export type JobStatus = "pending" | "accepted" | "rejected" | "completed";
export interface RequiredInstrumentsJSON {
    quantity: number;
    id: string;
}