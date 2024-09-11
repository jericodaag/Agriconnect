import { adminRoutes } from "./adminRoute";
import { sellerRoutes } from "./sellerRoutes";

export const privateRoutes = [
    ...adminRoutes,
    ...sellerRoutes
]