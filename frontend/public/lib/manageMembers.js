import ROLE_TYPES from "../data/role_types";

export function getAllChangedMembers(oldMembers, newMembers, members_prop_name) {
  const oldCreatorId = oldMembers.filter((m) => m.role.role_type === ROLE_TYPES.all_type)[0].id;
  const newCreatorId = newMembers.filter((m) => m.role.role_type === ROLE_TYPES.all_type)[0].id;
  const deletedMembers = oldMembers.filter((m) => !newMembers.find((cm) => cm.id === m.id));
  const creatorChange =
    oldCreatorId != newCreatorId ? newMembers.filter((cm) => cm.id === newCreatorId) : [];
  const createdMembers = newMembers.filter(
    (cm) =>
      !oldMembers.find((m) => m.id === cm.id) &&
      !creatorChange.find((m) => m.id === cm.id) &&
      !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
  );
  const updatedMembers = newMembers.filter(
    (cm) =>
      !oldMembers.includes(cm) &&
      !createdMembers.includes(cm) &&
      !creatorChange.find((m) => m.id === cm.id) &&
      !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
  );
  const allChangedMembers = [
    ...deletedMembers.map((m) => ({ ...m, operation: "delete" })),
    ...updatedMembers.map((m) => ({ ...m, operation: "update" })),
  ];
  if (createdMembers.length > 0)
    allChangedMembers.push({ [members_prop_name]: [...createdMembers], operation: "create" });

  if (creatorChange.length > 0)
    allChangedMembers.push({ new_creator: creatorChange[0], operation: "creator_change" });

  return allChangedMembers;
}

export function hasGreaterRole(user_role_type, other_user_role_type) {
  if (user_role_type === ROLE_TYPES.all_type) return true;
  if (
    user_role_type === ROLE_TYPES.read_write_type &&
    other_user_role_type === ROLE_TYPES.read_only_type
  )
    return true;
  return false;
}

export function getRoleWeight(role_type) {
  const role_types_array = Object.keys(ROLE_TYPES).map((k) => ROLE_TYPES[k]);
  return role_types_array.indexOf(role_type);
}
