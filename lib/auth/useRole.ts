import { useRoleContext } from "./RoleProvider";

export function useRole() {
  return useRoleContext();
}
