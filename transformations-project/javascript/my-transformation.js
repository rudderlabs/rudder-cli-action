import { capitalize } from "myLibrary";

export function transformEvent(event, metadata) {
  if (event.properties?.name) {
    event.properties.name = capitalize(event.properties.name);
  }
  return event;
}
