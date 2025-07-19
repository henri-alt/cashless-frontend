import { StaffMember } from "../tableTypes";

export type CreateStaffRequest = Omit<StaffMember, "memberId" | "company">;

export type PatchStaffRequest = Partial<
  Omit<StaffMember, "memberId" | "company" | "eventId">
>;

export type MemberLoginRequest = {
  memberEmail: string;
  memberPassword: string;
};

export type StaffQuery = {
  eventId?: string;
  userClass?: number;
};
