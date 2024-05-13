import { SvgIconComponent } from '@mui/icons-material';
import { Card, Drawer, lighten, Tab, Tabs, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode } from 'react';
import {
  FormDisplayIcon,
  FormGroupIcon,
  FormStringIcon,
  FormTextIcon,
} from '@/components/elements/SemanticIcons';
import theme from '@/config/theme';

interface PaletteCardProps {
  color?: string;
  icon?: SvgIconComponent;
  children?: ReactNode;
}

const PaletteCard: React.FC<PaletteCardProps> = ({
  color,
  icon: Icon,
  children,
}) => {
  return (
    <Card sx={{ p: 2, backgroundColor: color }}>
      <Stack gap={1} direction='row'>
        {Icon && <Icon />}
        {children}
      </Stack>
    </Card>
  );
};

const FormItemPalette = () => {
  // TODO - control drawer open and close - TBD if we will just leave it open, discuss w/ design
  // const [drawerOpen, setDrawerOpen] = useState(true);
  const drawerWidth = 240;
  const lightGreen = lighten(theme.palette.success.light, 0.95);

  return (
    <Drawer
      variant='persistent'
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          position: 'static',
          borderTop: 'none',
          boxSizing: 'border-box',
          p: 2,
        },
      }}
    >
      <Typography variant='cardTitle'>Form Elements</Typography>
      <Tabs
        sx={{
          mb: 2,
          '&. MuiTab-root': { p: 0, minWidth: 0 },
        }}
        value={0}
        onChange={() => {}}
        aria-label='basic tabs example'
      >
        <Tab label='Basic' />
        <Tab label='Hud' />
        <Tab label='Custom' />
      </Tabs>
      <Stack gap={1}>
        <Typography variant='caption'>Organization</Typography>
        {/* TODO - add the rest and update to match the designs */}
        {/* TODO - give PaletteCard variants instead of passing in colors individually */}
        {/* TODO - get the Icon from the same source as getItemDisplayAttrs in FormTreeItem.tsx */}
        <PaletteCard color={lightGreen} icon={FormGroupIcon}>
          Group
        </PaletteCard>
        <PaletteCard color={lightGreen} icon={FormDisplayIcon}>
          Display Text
        </PaletteCard>
        <Typography variant='caption'>Basic Inputs</Typography>
        <PaletteCard icon={FormStringIcon}>Text</PaletteCard>
        <PaletteCard icon={FormTextIcon}>Paragraph</PaletteCard>
      </Stack>
    </Drawer>
  );
};

export default FormItemPalette;
