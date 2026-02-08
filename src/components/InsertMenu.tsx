import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Plus,
  TableIcon,
  Image,
  Link,
  TrendingUp,
  BarChart3,
  MessageSquare,
  CheckSquare,
  Calendar,
} from "lucide-react";

interface InsertMenuProps {
  onPivotTable: () => void;
  onInsertChart: () => void;
  onInsertImage: () => void;
  onInsertLink: () => void;
  onInsertSparkline: () => void;
  onInsertComment: () => void;
  onInsertCheckbox: () => void;
  onInsertDate: () => void;
}

export function InsertMenu({
  onPivotTable,
  onInsertChart,
  onInsertImage,
  onInsertLink,
  onInsertSparkline,
  onInsertComment,
  onInsertCheckbox,
  onInsertDate,
}: InsertMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Plus className="w-4 h-4" />
          Insert
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Insert</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onPivotTable}>
          <TableIcon className="w-4 h-4 mr-2" />
          Pivot Table
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onInsertChart}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Chart
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onInsertSparkline}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Sparkline
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onInsertImage}>
          <Image className="w-4 h-4 mr-2" />
          Image
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onInsertLink}>
          <Link className="w-4 h-4 mr-2" />
          Hyperlink
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onInsertComment}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Comment
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onInsertCheckbox}>
          <CheckSquare className="w-4 h-4 mr-2" />
          Checkbox
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onInsertDate}>
          <Calendar className="w-4 h-4 mr-2" />
          Date
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}