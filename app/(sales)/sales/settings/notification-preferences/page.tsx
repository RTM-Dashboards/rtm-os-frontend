"use client";

import SalesSettingsBreadcrumb from "@/components/sales/settings/SalesSettingsBreadcrumb";
import NotificationRulesPage from "@/app/(shell)/settings/notification-rules/page";

export default function SalesNotificationPreferencesPage() {
  return (
    <>
      <SalesSettingsBreadcrumb section="Notification Preferences" />
      <NotificationRulesPage />
    </>
  );
}
