import { HeaderToolbar } from '@/components/level-editor/HeaderToolbar';
import { BobbinGridEditor } from '@/components/level-editor/BobbinGridEditor';
import { FabricGridEditor } from '@/components/level-editor/FabricGridEditor';
import { LiveVisualizer } from '@/components/level-editor/LiveVisualizer';
import { ValidationPanel } from '@/components/level-editor/ValidationPanel';
import { JsonPreview } from '@/components/level-editor/JsonPreview';
import { Separator } from '@/components/ui/separator';

export default function LevelEditorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderToolbar />
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Bobbin Editor and Visualizer */}
          <div className="space-y-6 lg:col-span-1">
            <BobbinGridEditor />
            <LiveVisualizer editorType="bobbin" />
          </div>

          {/* Column 2: Fabric Editor and Visualizer */}
          <div className="space-y-6 lg:col-span-1">
            <FabricGridEditor />
            <LiveVisualizer editorType="fabric" />
          </div>

          {/* Column 3: Validation and JSON Preview */}
          <div className="space-y-6 lg:col-span-1">
            <ValidationPanel />
            <Separator />
            <JsonPreview />
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Knit It Level Editor &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
