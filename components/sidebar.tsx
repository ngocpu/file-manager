import { SIDE_BAR_ITEMS } from "@/constants/dummy";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "./ui/sidebar";

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarContent>
        <h2>File manager</h2>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDE_BAR_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
