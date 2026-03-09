---
name: frontend-design
description: WPF frontend design specialist for SI360 POS. Use for creating dialogs, updating styles, layouts, and UI/UX guidance.
---

# Frontend Design Skill

You are a WPF frontend design specialist for the SI360 POS system. When invoked, analyze the user's request and provide expert guidance on UI/UX implementation.

## Context

- **Framework:** WPF (.NET 8.0) with MVVM pattern
- **Toolkit:** CommunityToolkit.MVVM for ViewModels
- **UI Library:** Xceed.Wpf.Toolkit for extended controls
- **Shared Styles:** `/SI360.UI;component/Styles/SharedStyles.xaml`
- **Theme:** Dark theme (Background: #1A1A1A, Accent: #013A7A)

## Design Standards

### NEVER Use System.Windows.MessageBox

> **IMPORTANT:** `System.Windows.MessageBox.Show` is **BANNED** from the entire SI360 codebase. It displays an ugly default Windows dialog that breaks the dark theme and is not WCAG accessible. **Always use `PosMessageDialog`** instead.

**Static Methods** (argument order is `title, message` — opposite of MessageBox):

| Method | Buttons | Border Color | Usage |
|--------|---------|-------------|-------|
| `PosMessageDialog.ShowError("title", "msg")` | OK | #9C0D0D (Red) | Errors, failures |
| `PosMessageDialog.ShowWarning("title", "msg")` | OK | #D4A017 (Amber) | Warnings, validation |
| `PosMessageDialog.ShowInfo("title", "msg")` | OK | #013A7A (Blue) | Success, informational |
| `PosMessageDialog.ShowConfirmation("title", "msg")` → `bool` | YES / NO | #013A7A (Blue) | Yes/No decisions |

**Source:** `SI360.UI/Views/PosMessageDialog.xaml` + `PosMessageDialog.xaml.cs`

**For ViewModels** (namespace `SI360.UI.ViewModels`): add `using SI360.UI.Views;`

### Color Palette (from SharedStyles.xaml)

| Brush Key | Color | Usage |
|-----------|-------|-------|
| `DarkBackgroundBrush` | #1A1A1A | Window/control backgrounds |
| `DarkPanelBrush` | #2A2A2A | Panel backgrounds, cards |
| `DarkBorderBrush` | #3A3A3A | Default borders |
| `PrimaryBlueBrush` | #013A7A | Primary actions (WCAG AAA: 9.3:1) |
| `PrimaryBlueHoverBrush` | #024B8F | Hover states (WCAG AAA: 7.2:1) |
| `PrimaryBluePressedBrush` | #013D70 | Pressed states (WCAG AAA: 9.1:1) |
| `SecondaryGrayBrush` | #1E2833 | Secondary actions (WCAG AAA: 11.3:1) |
| `SecondaryGrayHoverBrush` | #2E3D47 | Secondary hover (WCAG AAA: 8.2:1) |
| `DangerRedHoverBrush` | #7A1515 | Danger hover (WCAG AAA: 9.8:1) |
| `DangerRedPressedBrush` | #5A0E0E | Danger pressed (WCAG AAA: 12.2:1) |
| `DangerRedBrush` | #9C0D0D | Danger/cancel actions (WCAG AAA: 7.7:1) |
| `WhiteBrush` | #FFFFFF | Primary text |
| `ErrorRedBrush` | #8B0000 | Error text, borders, backgrounds |

> **IMPORTANT - WCAG AAA Compliance:** All text must have a minimum **7:1 contrast ratio** against its background (WCAG Level AAA). This ensures maximum readability on POS touchscreen displays under varying lighting conditions. Use a contrast checker tool to verify color combinations before implementing.

### Unified Typography Standards

**IMPORTANT:** The minimum font size for all UI elements is **16px**. This ensures readability on POS touchscreen displays. Never use font sizes smaller than 16px when generating code.

| Category | Element | Size | Weight | Color | Notes |
|----------|---------|------|--------|-------|-------|
| **Titles** | Page/Dialog Title | 28px | Bold | White | Main headers |
| **Titles** | Subtitle/Subheader | 18px | SemiBold | #FFFFFFCC | Secondary headers, metadata (14.4:1) |
| **Body** | Body/Item Text | 18px | Normal | White | General content, list items |
| **Body** | Item Name | 18px | SemiBold | White | Emphasized items |
| **Body** | Item Price/Value | 18px | Normal | #CCCCCC | Secondary values (10.5:1) |
| **Labels** | Stat Card Label | 18px | SemiBold | #CCCCCC | Uppercase labels (10.5:1) |
| **Labels** | Stat Card Value | 28px | Bold | Contextual | Green (#50FF7A 12.4:1), Orange (#FFBB33 8.5:1), White |
| **Labels** | Section Label | 20px | SemiBold | #AAAAAA | Above DataGrids, uppercase (7.4:1) |
| **DataGrid** | Header | 20px | Bold | White on #013A7A | Column headers (9.3:1) |
| **DataGrid** | Cell | 18px | Normal | White | Row content |
| **Buttons** | Action Button | 20px | SemiBold | White | Primary actions (Confirm/Cancel) |
| **Buttons** | Reason Button | 20px | Normal | White | Selection buttons |
| **Panels** | Panel Title | 20px | Bold | Accent | Detail panel headers |
| **Panels** | Panel Label | 18px | SemiBold | #CCCCCC | Field labels (10.5:1) |
| **Panels** | Panel Value | 18px | Normal | White | Field values |
| **Special** | Icon Badge | 28px | Bold | Accent | Badge icons/symbols |
| **Special** | Error Text | 16px | Normal | #8B0000 | Error messages (7.8:1) |
| **Special** | Separator Pipes | 18px | Normal | #FFFFFFCC | " \| " delimiters |

**SharedStyles.xaml Reference:**

| Style Key | Maps To |
|-----------|---------|
| `HeaderTextStyle` | Page/Dialog Title (28px Bold White) |
| `SubheaderTextStyle` | Subtitle/Subheader (18px SemiBold #FFFFFFCC) |
| `BodyTextStyle` | Body/Item Text (18px Normal White) |
| `ErrorTextStyle` | Error Text (18px Normal #8B0000) |
| `DetailLabelStyle` | Detail Labels (18px SemiBold White) |
| `DetailValueStyle` | Detail Values (20px SemiBold #50FF7A, Right-aligned, WCAG AAA: 12.4:1) |

### Shared Button Styles (from SharedStyles.xaml)

| Style Key | Background | Contrast | Usage |
|-----------|------------|----------|-------|
| `PrimaryButtonStyle` | #013A7A | 9.3:1 | Main actions, confirm buttons |
| `DangerButtonStyle` | #9C0D0D | 7.7:1 | delete, destructive actions |
| `ExitButtonStyle` | #1E2833 | 14.7:1 | Exit, close, cancel |
| `RoomButtonStyle` | #013A7A | 9.3:1 | Room/table selection |

**Usage in XAML:**

> **IMPORTANT:** SharedStyles.xaml **must always be imported** into every XAML file (Window, UserControl, Dialog). This ensures consistent styling across the application and access to shared resources like button styles, brushes, and typography.

```xml
<Window.Resources>
    <ResourceDictionary>
        <ResourceDictionary.MergedDictionaries>
            <ResourceDictionary Source="/SI360.UI;component/Styles/SharedStyles.xaml"/>
        </ResourceDictionary.MergedDictionaries>
    </ResourceDictionary>
</Window.Resources>

<Button Content="CONFIRM"
        Style="{DynamicResource PrimaryButtonStyle}"/>
<Button Content="CANCEL"
        Style="{DynamicResource DangerButtonStyle}"/>
```

### Custom Scrollbar (ModernScrollBarStyle)

For scrollable content, use the modern scrollbar style from SharedStyles.xaml:

```xml
<ScrollViewer Style="{StaticResource ModernScrollViewerStyle}"
              VerticalScrollBarVisibility="Auto"
              HorizontalScrollBarVisibility="Disabled">
    <!-- Content here -->
</ScrollViewer>
```

The scrollbar features:
- **Track:** Transparent background
- **Thumb:** #80FFFFFF (semi-transparent white)
- **Width:** 4px

### Scroll Indicator Behavior (ScrollIndicatorBehavior)

**IMPORTANT:** Any `ScrollViewer` with content that may overflow its visible area **MUST** use the `ScrollIndicatorBehavior` attached behavior to show an animated directional arrow indicator. This is required for all scrollable lists, order panels, and any vertically scrollable content in the application.

**Reference:** `TableSelectionView.xaml` → `OrderListScrollViewer`

**Requirements:**
1. The `ScrollViewer` **must** be wrapped in a `Grid` (immediate parent)
2. Set `VerticalScrollBarVisibility="Hidden"` to hide the default scrollbar
3. Enable the behavior with `behaviors:ScrollIndicatorBehavior.IsEnabled="True"`

**XAML Pattern (single-row Grid wrapper):**
```xml
xmlns:behaviors="clr-namespace:SI360.UI.Behaviors"

<Grid>
    <ScrollViewer VerticalScrollBarVisibility="Hidden"
                  behaviors:ScrollIndicatorBehavior.IsEnabled="True"
                  behaviors:ScrollIndicatorBehavior.IndicatorImageSource="/Media/arrow-down.png"
                  behaviors:ScrollIndicatorBehavior.IndicatorSize="32">
        <ItemsControl ItemsSource="{Binding Items}">
            <!-- Scrollable content -->
        </ItemsControl>
    </ScrollViewer>
</Grid>
```

**XAML Pattern (multi-row Grid — indicator auto-positions to ScrollViewer's row):**
```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>  <!-- Header row -->
        <RowDefinition Height="*"/>     <!-- Content row -->
    </Grid.RowDefinitions>

    <TextBlock Grid.Row="0" Text="HEADER" />

    <ScrollViewer Grid.Row="1"
                  VerticalScrollBarVisibility="Hidden"
                  behaviors:ScrollIndicatorBehavior.IsEnabled="True"
                  behaviors:ScrollIndicatorBehavior.IndicatorImageSource="/Media/arrow-down.png"
                  behaviors:ScrollIndicatorBehavior.IndicatorSize="32">
        <ItemsControl ItemsSource="{Binding Items}" />
    </ScrollViewer>
</Grid>
```

**Attached Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `IsEnabled` | bool | false | Enables the scroll indicator |
| `IndicatorImageSource` | string | `/Media/arrow-down.png` | Down-arrow image path |
| `IndicatorUpImageSource` | string | `/Media/arrow-up.png` | Up-arrow image path (shown at bottom) |
| `IndicatorSize` | double | 32.0 | Width and height of the indicator image |

**Behavior:**
- Shows a **down arrow** when content overflows and user is not at the bottom
- Switches to an **up arrow** when user scrolls to the bottom
- Uses a **pulsing animation** (opacity 0.4 → 1.0, 800ms cycle) to draw attention
- Automatically hides when content fits within the viewport
- Performs periodic visibility checks (every 1500ms) for dynamic content updates
- Cleans up timers and event handlers on unload (memory safe)

**Key Rules:**

| Rule | Description |
|------|-------------|
| **Parent must be Grid** | The ScrollViewer's immediate parent must be a `Grid` for overlay positioning |
| **Auto Grid positioning** | The indicator automatically inherits `Grid.Row`, `Grid.Column`, `Grid.RowSpan`, and `Grid.ColumnSpan` from the ScrollViewer — it always appears at the **bottom** of the correct Grid cell |
| **Hide default scrollbar** | Always set `VerticalScrollBarVisibility="Hidden"` |
| **Image assets required** | Ensure `/Media/arrow-down.png` and `/Media/arrow-up.png` exist in project |
| **Use on all scrollable lists** | Apply to order lists, item lists, and any panel with potential overflow |
| **Wrap in Grid if needed** | If the ScrollViewer's parent is a `Border`, `StackPanel`, etc., wrap it in a `<Grid>` first |

**Source:** `SI360.UI/Behaviors/ScrollIndicatorBehavior.cs`

### Button Height Standards

**IMPORTANT:** All action buttons must use a height of **64px** for consistency across the application.

| Context | Height | Usage |
|---------|--------|-------|
| Action Buttons | 64px | Confirm, Cancel, Save, Delete, Print, Refresh |
| Numpad Buttons | 64px | Numeric input keys |
| Navigation Buttons | 64px | Tab switches, menu items |
| Small/Secondary | 45px | Only for very compact layouts (avoid if possible) |

### DataGrid/Table Styling Standards

**IMPORTANT:** Use these standardized styles for all DataGrid and table displays to ensure consistency across the application.

#### Standard DataGrid Style (ReportDataGridStyle)

Use this style for order lists, reports, and data tables:

```xml
<Style x:Key="ReportDataGridStyle" TargetType="DataGrid">
    <Setter Property="Background" Value="#1E1E1E"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="BorderBrush" Value="#404040"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="GridLinesVisibility" Value="Horizontal"/>
    <Setter Property="HorizontalGridLinesBrush" Value="#404040"/>
    <Setter Property="RowBackground" Value="#252525"/>
    <Setter Property="AlternatingRowBackground" Value="#2A2A2A"/>
    <Setter Property="HeadersVisibility" Value="Column"/>
    <Setter Property="AutoGenerateColumns" Value="False"/>
    <Setter Property="CanUserAddRows" Value="False"/>
    <Setter Property="CanUserDeleteRows" Value="False"/>
    <Setter Property="IsReadOnly" Value="True"/>
    <Setter Property="SelectionMode" Value="Single"/>
    <Setter Property="FontSize" Value="18"/>
</Style>
```

#### Column Header Style

**Standard (Primary Blue - WCAG AAA)** - Use for all DataGrids:

```xml
<Style x:Key="DataGridHeaderStyle" TargetType="DataGridColumnHeader">
    <Setter Property="Background" Value="#013A7A"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="FontWeight" Value="Bold"/>
    <Setter Property="FontSize" Value="20"/>
    <Setter Property="Padding" Value="12,10"/>
    <Setter Property="HorizontalContentAlignment" Value="Left"/>
    <Setter Property="BorderThickness" Value="0,0,1,0"/>
    <Setter Property="BorderBrush" Value="#404040"/>
</Style>
```

#### Cell Style

```xml
<Style x:Key="DataGridCellStyle" TargetType="DataGridCell">
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="Padding" Value="10,8"/>
    <Setter Property="BorderThickness" Value="0"/>
    <Setter Property="FocusVisualStyle" Value="{x:Null}"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="DataGridCell">
                <Border Background="{TemplateBinding Background}"
                        BorderBrush="{TemplateBinding BorderBrush}"
                        BorderThickness="{TemplateBinding BorderThickness}"
                        Padding="{TemplateBinding Padding}">
                    <ContentPresenter VerticalAlignment="Center"/>
                </Border>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
    <Style.Triggers>
        <Trigger Property="IsSelected" Value="True">
            <Setter Property="Background" Value="#013A7A"/>
        </Trigger>
    </Style.Triggers>
</Style>
```

#### DataGrid Property Standards

| Property | Value | Notes |
|----------|-------|-------|
| **Row Height** | 52px | Let content determine or fixed for consistency |
| **Header Font Size** | 20px | Consistent across all DataGrids |
| **Cell Font Size** | 18px | Consistent across all DataGrids |
| **Header Padding** | 12,10 | Consistent across all tables |
| **Cell Padding** | 12,10 | Consistent across all tables |
| **Row Background** | #252525 | Dark theme |
| **Alternating Row** | #2A2A2A | Subtle contrast |
| **Grid Lines** | Horizontal only, #404040 | Clean look |
| **Selected Row** | #013A7A | Primary blue highlight (WCAG AAA 9.3:1) |
| **Border** | 1px, #404040 | Standard border color |
| **DataGridTemplateColumn Width** | `AUTO` | **Always use Width="AUTO"** for template columns |

#### DataGrid with Inline Styles (Complete Example)

```xml
<DataGrid ItemsSource="{Binding Orders}"
          Style="{StaticResource ReportDataGridStyle}"
          ColumnHeaderStyle="{StaticResource DataGridHeaderStyle}"
          CellStyle="{StaticResource DataGridCellStyle}">
    <DataGrid.Columns>
        <DataGridTextColumn Header="CHECK #" Binding="{Binding CheckNumber}" Width="AUTO"/>
        <DataGridTextColumn Header="DESCRIPTION" Binding="{Binding Description}" Width="*"/>
        <DataGridTextColumn Header="EMPLOYEE" Binding="{Binding EmployeeName}" Width="AUTO"/>
        <DataGridTextColumn Header="TABLE" Binding="{Binding TableName}" Width="AUTO"/>
        <DataGridTextColumn Header="START DATE" Binding="{Binding StartDate, StringFormat=MMM dd, yyyy HH:mm}" Width="AUTO"/>
        <DataGridTextColumn Header="TOTAL" Binding="{Binding Total, StringFormat=C}" Width="AUTO">
            <DataGridTextColumn.ElementStyle>
                <Style TargetType="TextBlock">
                    <Setter Property="HorizontalAlignment" Value="Right"/>
                    <Setter Property="Foreground" Value="#50FF7A"/>
                </Style>
            </DataGridTextColumn.ElementStyle>
        </DataGridTextColumn>
    </DataGrid.Columns>
</DataGrid>
```

#### Currency/Money Column Styling

For columns displaying money values, use green text and right alignment:

```xml
<DataGridTextColumn Header="AMOUNT" Binding="{Binding Amount, StringFormat=C}" Width="100">
    <DataGridTextColumn.ElementStyle>
        <Style TargetType="TextBlock">
            <Setter Property="HorizontalAlignment" Value="Right"/>
            <Setter Property="Foreground" Value="#50FF7A"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
        </Style>
    </DataGridTextColumn.ElementStyle>
</DataGridTextColumn>
```

#### Order Items List Style (MainOrderingView Pattern)

For displaying order items with seat grouping:

**Seat Group Container:**
```xml
<Border Background="#333333" Margin="0,0,0,12" CornerRadius="6">
    <!-- Seat Header -->
    <Border Background="#8034495E" CornerRadius="6,6,0,0" Padding="12,8">
        <StackPanel Orientation="Horizontal">
            <!-- Seat Number Badge (Circle) -->
            <Border Background="#FFFFFF" CornerRadius="14" Width="28" Height="28"
                    VerticalAlignment="Center" Margin="0,0,10,0">
                <TextBlock Text="{Binding SeatNumber}" Foreground="#013A7A"
                           FontSize="18" FontWeight="Bold"
                           HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <TextBlock Text="{Binding CustomerName}" Foreground="White"
                       FontSize="18" FontWeight="SemiBold" VerticalAlignment="Center"/>
        </StackPanel>
    </Border>

    <!-- Order Items -->
    <ItemsControl ItemsSource="{Binding Items}">
        <ItemsControl.ItemTemplate>
            <DataTemplate>
                <Border Padding="8,6" BorderThickness="2,0,0,1" BorderBrush="#444444">
                    <Grid>
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="50"/>  <!-- Qty -->
                            <ColumnDefinition Width="*"/>   <!-- Name -->
                            <ColumnDefinition Width="80"/>  <!-- Price -->
                        </Grid.ColumnDefinitions>
                        <TextBlock Grid.Column="0" Text="{Binding Quantity}"
                                   FontSize="20" FontWeight="SemiBold" Foreground="White"/>
                        <TextBlock Grid.Column="1" Text="{Binding ItemName}"
                                   FontSize="18" FontWeight="SemiBold" Foreground="White" TextWrapping="Wrap"/>
                        <TextBlock Grid.Column="2" Text="{Binding Price, StringFormat=C}"
                                   FontSize="20" FontWeight="SemiBold" Foreground="#50FF7A"
                                   HorizontalAlignment="Right"/>
                    </Grid>
                </Border>
            </DataTemplate>
        </ItemsControl.ItemTemplate>
    </ItemsControl>
</Border>
```

**Order Item Text Standards:**

| Element | Font Size | Font Weight | Color |
|---------|-----------|-------------|-------|
| Quantity | 20px | SemiBold | White |
| Item Name | 18px | SemiBold | White |
| Price | 20px | SemiBold | #50FF7A (Green, WCAG AAA 12.4:1) |
| Modifier Qty | 18px | Normal | #AAAAAA |
| Modifier Name | 18px | Normal, Italic | #AAAAAA |
| Modifier Price | 18px | Normal, Italic | #AAAAAA |

**Selected Item Styling:**
```xml
<Style.Triggers>
    <DataTrigger Binding="{Binding IsSelected}" Value="True">
        <Setter Property="BorderBrush" Value="#013A7A"/>
        <Setter Property="Background" Value="#1A013A7A"/>
    </DataTrigger>
</Style.Triggers>
```

#### Application Colors (WCAG AAA Compliant)

| Color | Hex | Contrast | Usage |
|-------|-----|----------|-------|
| Green | #50FF7A | 12.4:1 | Positive amounts, sales, totals, tips, success badges |
| Accept Button | #265E08 | 7.81:1 | Accept, print, reprint | pay
| Red | #9C0D0D | 7.7:1 | Negative amounts, refunds, voids, alert badges |
| Danger Button | #9C0D0D | 7.7:1 | Exit, close, cancel, delete buttons |
| Orange | #FFBB33 | 8.5:1 | Discounts, warnings, pending items |
| Blue | #013A7A | 9.3:1 | Headers, primary actions, selected items, info badges |
| White | #FFFFFF | 16.1:1 | Primary text |
| Light Gray | #F5F5F5 | 14.4:1 | Separator pipes, delimiters, subheaders |
| Gray | #CCCCCC | 10.5:1 | Secondary text, labels, descriptions, modifiers |
| Secondary Gray | #AAAAAA | 7.4:1 | Section labels (use on #1A1A1A only) |
| Dark Gray | #333333 | - | Section total backgrounds |
| Row Dark | #252525 | - | Standard row background |
| Row Alt | #2A2A2A | - | Alternating row background |
| Panel Header | #8034495E | - | Semi-transparent report header backgrounds |

#### Report View Local Styles

These styles are commonly defined locally in report views (EmployeeCashoutReportView, DeviceCashoutReportView) and can be reused:

**DarkExpanderStyle** - Collapsible sections:
```xml
<Style x:Key="DarkExpanderStyle" TargetType="Expander">
    <Setter Property="Background" Value="#2A2A2A"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="BorderBrush" Value="#404040"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Margin" Value="0,0,0,15"/>
    <Setter Property="Padding" Value="15,12"/>
</Style>
```

**SummaryCardStyle** - Quick metric cards:
```xml
<Style x:Key="SummaryCardStyle" TargetType="Border">
    <Setter Property="Background" Value="#2A2A2A"/>
    <Setter Property="CornerRadius" Value="8"/>
    <Setter Property="Padding" Value="20"/>
    <Setter Property="Margin" Value="5"/>
</Style>
```

**SectionTotalStyle** - Total row styling with inherited font size:
```xml
<Style x:Key="SectionTotalStyle" TargetType="Border">
    <Setter Property="Background" Value="#333333"/>
    <Setter Property="Padding" Value="15,10"/>
    <Setter Property="Margin" Value="0,0,0,5"/>
    <Setter Property="TextElement.FontSize" Value="18"/>
</Style>
```

**Usage - Summary Cards:**
```xml
<UniformGrid Columns="4" Margin="0,0,0,20">
    <Border Style="{StaticResource SummaryCardStyle}">
        <StackPanel>
            <TextBlock Text="TOTAL SALES" Foreground="#AAAAAA" FontSize="18" FontWeight="SemiBold"/>
            <TextBlock Text="{Binding TotalSales, StringFormat=C}" Foreground="White" FontSize="28" FontWeight="Bold"/>
        </StackPanel>
    </Border>
    <Border Style="{StaticResource SummaryCardStyle}">
        <StackPanel>
            <TextBlock Text="TOTAL TIPS" Foreground="#AAAAAA" FontSize="18" FontWeight="SemiBold"/>
            <TextBlock Text="{Binding TotalTips, StringFormat=C}" Foreground="#50FF7A" FontSize="28" FontWeight="Bold"/>
        </StackPanel>
    </Border>
</UniformGrid>
```

**Usage - Section Total Row:**
```xml
<Border Style="{StaticResource SectionTotalStyle}">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="150"/>
        </Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="TOTALS:" Foreground="White" FontWeight="Bold"/>
        <TextBlock Grid.Column="1" Text="{Binding TotalAmount}" Foreground="#50FF7A"
                   FontWeight="Bold" TextAlignment="Right"/>
    </Grid>
</Border>
```

### Expander with Count Badge Pattern

For section headers that display a count (e.g., "OPEN CHECKS (5)"), use this badge pattern:

```xml
<Expander Style="{StaticResource DarkExpanderStyle}" IsExpanded="True">
    <Expander.Header>
        <StackPanel Orientation="Horizontal">
            <TextBlock Text="OPEN CHECKS" FontSize="18" FontWeight="SemiBold" Foreground="White"/>
            <Border Background="#9C0D0D" CornerRadius="10" Padding="8,2" Margin="10,0,0,0">
                <TextBlock Text="{Binding OpenChecksCount}" Foreground="White" FontSize="18" FontWeight="Bold"/>
            </Border>
        </StackPanel>
    </Expander.Header>
    <!-- Section content -->
</Expander>
```

### DatePicker Dark Theme Integration

For DatePicker controls in report views, use `ReportDatePickerStyle` with `CalendarStyleBehavior`:

```xml
xmlns:behaviors="clr-namespace:SI360.UI.Behaviors"

<DatePicker Style="{StaticResource ReportDatePickerStyle}"
            SelectedDate="{Binding StartDate}"
            behaviors:CalendarStyleBehavior.ApplyDarkTheme="True"/>
```

**ReportDatePickerStyle properties (from SharedStyles.xaml):**
- Width: 180px
- Height: 48px
- FontSize: 18px
- Background: #2A2A2A
- BorderBrush: #404040
- Calendar popup with dark theme and WCAG AAA contrast ratios

**CalendarStyleBehavior** applies dark theme styling to the Calendar popup at runtime:
- Solid #2A2A2A background (no transparency)
- Day buttons: #404040 bg, 16px font, Hand cursor
- WCAG AAA compliant contrast ratios:
  - Hover: #383838 (8.3:1)
  - Selected: #01366F (9.1:1)
  - Today: #0F4821 (10.2:1)
  - Inactive: #CCCCCC text (7.3:1)

### User Function Dialog Header Style

**IMPORTANT:** All dialogs in the User Function menu must use the semi-transparent header background `#8034495E` for visual consistency.

```xml
<!-- User Function Header Style -->
<Border Grid.Row="0"
        CornerRadius="8,8,0,0"
        Background="#8034495E"
        Padding="20,15">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>

        <!-- Title and subtitle -->
        <StackPanel Grid.Column="0">
            <TextBlock Text="DIALOG TITLE"
                       Style="{DynamicResource HeaderTextStyle}"
                       FontSize="28"/>
            <TextBlock Text="Subtitle or description"
                       Foreground="#FFFFFFCC"
                       FontSize="18"
                       Margin="0,5,0,0"/>
        </StackPanel>
    </Grid>
</Border>
```

**Header Style Properties:**

| Property | Value | Notes |
|----------|-------|-------|
| Background | #8034495E | Semi-transparent dark teal (50% opacity) |
| CornerRadius | 8,8,0,0 or 6,6,0,0 | Rounded top corners only |
| Padding | 20,15 | Standard header padding |
| Title FontSize | 28px | HeaderTextStyle |
| Subtitle Foreground | #FFFFFFCC | WCAG AAA 7.4:1 on dark |

---

### Dialog Component Standards

#### IMPORTANT: Proper Dialog Ownership and Dim Effects

**All payment dialogs and modal dialogs opened from a parent view MUST:**

1. **Use the correct owner window** - Dialogs should be owned by the view that opens them (e.g., `PayCheckView`), NOT `Application.Current.MainWindow`. This ensures proper centering and z-ordering.

2. **Implement dim overlay** - The parent view should display a dim overlay when dialogs are open to provide visual focus on the dialog.

**ViewModel Pattern:**
```csharp
// Add observable property for dim overlay visibility
[ObservableProperty]
private bool _isDialogOpen = false;

// In dialog handling method:
private async Task HandlePaymentDialogAsync(decimal amount)
{
    // Find the correct owner window (the view that opens this dialog)
    var ownerWindow = Application.Current.Windows.OfType<Views.PayCheckView>().FirstOrDefault()
                      ?? Application.Current.Windows.OfType<Window>().FirstOrDefault(w => w.IsActive)
                      ?? Application.Current.MainWindow;

    var dialog = new Views.PaymentDialog
    {
        DataContext = viewModel,
        Owner = ownerWindow  // Use specific view as owner, NOT MainWindow
    };

    // Show dim overlay BEFORE dialog
    IsDialogOpen = true;
    var dialogResult = dialog.ShowDialog();
    IsDialogOpen = false;  // Hide dim overlay AFTER dialog closes
}
```

**XAML Pattern (Parent View):**
```xml
<Grid x:Name="RootGrid" Background="{StaticResource DarkPanelBrush}">
    <!-- Main Content -->
    <Border BorderBrush="{StaticResource DarkBorderBrush}" ...>
        <!-- View content here -->
    </Border>

    <!-- Dialog Dim Overlay - Shows when any dialog is open -->
    <Border x:Name="DialogDimOverlay"
            Background="#C0000000"
            Visibility="{Binding IsDialogOpen, Converter={StaticResource BooleanToVisibilityConverter}}"
            IsHitTestVisible="True"/>
</Grid>
```

**Dim Overlay Properties:**
| Property | Value | Notes |
|----------|-------|-------|
| Background | #C0000000 | 75% black overlay |
| IsHitTestVisible | True | Blocks clicks to content below |
| Visibility | Bound to IsDialogOpen | Controlled by ViewModel |

**Example Views Using This Pattern:**
- `PayCheckView.xaml` - Payment dialogs (Credit Card, Gift Card, Direct Billing)

#### Standard Modal Dialog (Centered)

**Window Properties:**
- `WindowStyle="None"`, `AllowsTransparency="True"`
- `Background="{DynamicResource DarkBackgroundBrush}"`
- `ResizeMode="NoResize"` or `ResizeMode="CanResize"`
- `WindowStartupLocation="CenterOwner"`

**Outer Border:**
```xml
<Border BorderBrush="#013A7A"
        BorderThickness="2"
        CornerRadius="8">
    <Grid Margin="20">
        <!-- Content -->
    </Grid>
</Border>
```

#### Full-Screen Modal Pattern

For report views, data grids, or complex multi-panel layouts, use full-screen mode.

**Reference:** `CombineCheckDialog.xaml`

**Window Properties:**
```xml
<Window x:Class="SI360.UI.Views.CombineCheckDialog"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Combine Checks"
        Width="1280"
        Height="720"
        WindowState="Maximized"
        WindowStartupLocation="CenterOwner"
        ResizeMode="CanResize"
        ShowInTaskbar="False"
        Background="#1A1A1A"
        WindowStyle="None"
        AllowsTransparency="True">
```

**Full-Screen Layout Structure:**
```xml
<Border BorderBrush="#013A7A" BorderThickness="2" CornerRadius="10" Background="#1A1A1A">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>  <!-- Header -->
            <RowDefinition Height="*"/>      <!-- Content -->
        </Grid.RowDefinitions>

        <!-- Header Section (User Function Style) -->
        <Border Grid.Row="0" CornerRadius="8,8,0,0" Background="#8034495E">
            <Grid Margin="24,20">
                <StackPanel Orientation="Horizontal">
                    <!-- Icon Circle -->
                    <Border Width="48" Height="48" CornerRadius="24"
                            Background="#024B8F" Margin="0,0,16,0">
                        <TextBlock Text="&#x2795;" FontSize="22" Foreground="White"
                                   HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                    <StackPanel VerticalAlignment="Center">
                        <TextBlock Text="Dialog Title" FontSize="28" FontWeight="Bold" Foreground="White"/>
                        <TextBlock Text="Subtitle description" FontSize="18" Foreground="#CCCCCC" Margin="0,2,0,0"/>
                    </StackPanel>
                </StackPanel>
            </Grid>
        </Border>

        <!-- Main Content with Footer -->
        <Grid Grid.Row="1" Margin="24,20,24,24">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>  <!-- Info panels, stats cards -->
                <RowDefinition Height="*"/>      <!-- Scrollable content -->
                <RowDefinition Height="Auto"/>  <!-- Summary panel (optional) -->
                <RowDefinition Height="Auto"/>  <!-- Action buttons footer -->
            </Grid.RowDefinitions>

            <!-- Content sections here -->

            <!-- Action Buttons Footer (Full-Screen Layout Structure) -->
            <Border Grid.Row="3"
                    Background="#1A1A1A"
                    BorderBrush="#404040"
                    BorderThickness="0,1,0,0"
                    Padding="20,15"
                    Margin="-24,0,-24,-24"
                    CornerRadius="0,0,8,8">
                <StackPanel Orientation="Horizontal" HorizontalAlignment="Right">
                    <!-- Cancel with icon -->
                    <Button Style="{DynamicResource ExitButtonStyle}"
                            Height="64" Padding="20,0" Margin="0,0,15,0"
                            Click="CloseButton_Click" IsCancel="True">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="&#x2715;" FontSize="20" VerticalAlignment="Center" Margin="0,0,8,0"/>
                            <TextBlock Text="CANCEL" FontSize="20" FontWeight="SemiBold" VerticalAlignment="Center"/>
                        </StackPanel>
                    </Button>
                    <!-- Primary action with icon -->
                    <Button Style="{StaticResource PrimaryButtonStyle}"
                            Height="64" Padding="20,0">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="&#x2795;" FontSize="20" VerticalAlignment="Center" Margin="0,0,10,0"/>
                            <TextBlock Text="ACTION" FontSize="20" FontWeight="SemiBold" VerticalAlignment="Center"/>
                        </StackPanel>
                    </Button>
                </StackPanel>
            </Border>
        </Grid>
    </Grid>
</Border>
```

**Footer Button Pattern:**
- Right-aligned StackPanel with horizontal orientation
- CANCEL button first with `ExitButtonStyle`, 15px right margin
- Primary action button second with `PrimaryButtonStyle` or custom style
- Both buttons: Height 64px, Padding 20,0, icon + text in horizontal StackPanel
- Footer Border: negative margin `-24,0,-24,-24` to extend to edges, `CornerRadius="0,0,8,8"`

**When to Use Full-Screen:**
- Reports with multiple data sections (Employee Cashout, Device Cashout)
- Views with large data grids or tables
- Multi-panel layouts requiring maximum screen space
- Complex forms with many input fields
- Dialogs combining multiple checks or data sources

### Text Input Style

```xml
<Style x:Key="TextInputStyle" TargetType="TextBox">
    <Setter Property="Background" Value="#2C2C2C"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="BorderBrush" Value="#404040"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Padding" Value="12,10"/>
    <Setter Property="FontSize" Value="16"/>
    <Setter Property="CaretBrush" Value="White"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="TextBox">
                <Border Background="{TemplateBinding Background}"
                        BorderBrush="{TemplateBinding BorderBrush}"
                        BorderThickness="{TemplateBinding BorderThickness}"
                        CornerRadius="4">
                    <ScrollViewer x:Name="PART_ContentHost"
                                  Margin="{TemplateBinding Padding}"/>
                </Border>
                <ControlTemplate.Triggers>
                    <Trigger Property="IsFocused" Value="True">
                        <Setter Property="BorderBrush" Value="#013A7A"/>
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

### Search TextBox Style

For search inputs with icon and placeholder, use this pattern:

```xml
<!-- Search TextBox Style (SI360 Design Standards - WCAG AAA) -->
<Style x:Key="SearchTextBoxStyle" TargetType="TextBox">
    <Setter Property="Background" Value="#2A2A2A"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="BorderBrush" Value="#404040"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Height" Value="52"/>
    <Setter Property="Padding" Value="44,0,12,0"/>
    <Setter Property="FontSize" Value="18"/>
    <Setter Property="CaretBrush" Value="White"/>
    <Setter Property="VerticalContentAlignment" Value="Center"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="TextBox">
                <Border x:Name="border"
                        Background="{TemplateBinding Background}"
                        BorderBrush="{TemplateBinding BorderBrush}"
                        BorderThickness="{TemplateBinding BorderThickness}"
                        CornerRadius="6">
                    <Grid>
                        <!-- Search Icon (WCAG AAA: #AAAAAA on #2A2A2A = 7.4:1) -->
                        <Path x:Name="SearchIcon"
                              Data="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                              Fill="#AAAAAA"
                              Width="20" Height="20"
                              Stretch="Uniform"
                              HorizontalAlignment="Left"
                              VerticalAlignment="Center"
                              Margin="14,0,0,0"
                              IsHitTestVisible="False"/>
                        <ScrollViewer x:Name="PART_ContentHost"
                                      Margin="{TemplateBinding Padding}"
                                      VerticalAlignment="Center"/>
                        <!-- Placeholder Text -->
                        <TextBlock x:Name="placeholder"
                                   Text="Search..."
                                   FontSize="18"
                                   Foreground="#AAAAAA"
                                   VerticalAlignment="Center"
                                   Margin="44,0,0,0"
                                   IsHitTestVisible="False"
                                   Visibility="Collapsed"/>
                    </Grid>
                </Border>
                <ControlTemplate.Triggers>
                    <!-- Focus State (WCAG AAA: #013A7A = 9.3:1) -->
                    <Trigger Property="IsFocused" Value="True">
                        <Setter TargetName="border" Property="BorderBrush" Value="#013A7A"/>
                        <Setter TargetName="border" Property="BorderThickness" Value="2"/>
                        <Setter TargetName="SearchIcon" Property="Fill" Value="#CCCCCC"/>
                    </Trigger>
                    <!-- Placeholder Visibility -->
                    <Trigger Property="Text" Value="">
                        <Setter TargetName="placeholder" Property="Visibility" Value="Visible"/>
                    </Trigger>
                    <!-- Hover State -->
                    <Trigger Property="IsMouseOver" Value="True">
                        <Setter TargetName="border" Property="BorderBrush" Value="#505050"/>
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

**SearchTextBox Properties:**

| Property | Value | Notes |
|----------|-------|-------|
| Height | 52px | Touch-friendly target |
| Background | #2A2A2A | Dark panel background |
| BorderBrush | #404040 | Standard border |
| Focus Border | #013A7A | Primary blue (9.3:1) |
| Icon Color | #AAAAAA | WCAG AAA 7.4:1 |
| Placeholder | #AAAAAA | WCAG AAA 7.4:1 |
| FontSize | 18px | Minimum body text |

## Numpad Component (from QuantityInputDialog.xaml)

For numeric input dialogs, use this numpad pattern:

```xml
<Style x:Key="NumPadButtonStyle" TargetType="Button">
    <Setter Property="Background" Value="#2C2C2C"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="FontSize" Value="24"/>
    <Setter Property="FontWeight" Value="Bold"/>
    <Setter Property="Margin" Value="3"/>
    <Setter Property="Cursor" Value="Hand"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="Button">
                <Border Background="{TemplateBinding Background}"
                        CornerRadius="4"
                        BorderBrush="#404040"
                        BorderThickness="1">
                    <ContentPresenter HorizontalAlignment="Center"
                                      VerticalAlignment="Center"/>
                </Border>
                <ControlTemplate.Triggers>
                    <Trigger Property="IsMouseOver" Value="True">
                        <Setter Property="Background" Value="#3C3C3C"/>
                    </Trigger>
                    <Trigger Property="IsPressed" Value="True">
                        <Setter Property="Background" Value="#013A7A"/>
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

**Numpad Layout (3x4 Grid):**
```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="*"/>  <!-- 7-8-9 -->
        <RowDefinition Height="*"/>  <!-- 4-5-6 -->
        <RowDefinition Height="*"/>  <!-- 1-2-3 -->
        <RowDefinition Height="*"/>  <!-- C-0-Backspace -->
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>

    <!-- Row 0: 7-8-9 -->
    <Button Grid.Row="0" Grid.Column="0" Content="7" Style="{StaticResource NumPadButtonStyle}"
            Command="{Binding NumberPressCommand}" CommandParameter="7"/>
    <!-- ... more buttons ... -->

    <!-- Row 3: Clear-0-Backspace -->
    <Button Grid.Row="3" Grid.Column="0" Content="C" Style="{StaticResource NumPadButtonStyle}"
            Command="{Binding ClearCommand}" Background="#8B0000"/>
    <Button Grid.Row="3" Grid.Column="1" Content="0" Style="{StaticResource NumPadButtonStyle}"
            Command="{Binding NumberPressCommand}" CommandParameter="0"/>
    <Button Grid.Row="3" Grid.Column="2" Content="&#x232B;" Style="{StaticResource NumPadButtonStyle}"
            Command="{Binding BackspaceCommand}" Background="#555555"/>
</Grid>
```

## IMPORTANT: Currency-Style Input (POS Standard)

**All payment amount keypads MUST use currency-style (cents-based) input.** This is the standard approach for POS systems where amounts are always in dollars.cents format.

### How It Works

Digits are entered from **right to left** with automatic decimal placement:
- Internal value tracked as **cents** (integer)
- Display shows **dollars.cents** (value ÷ 100)
- No manual decimal entry needed for standard amounts

### Input Examples

| Action | Internal Cents | Display |
|--------|---------------|---------|
| Start | 0 | 0.00 |
| Press `5` | 5 | 0.05 |
| Press `2` | 52 | 0.52 |
| Press `3` | 523 | 5.23 |
| Press `DEL` | 52 | 0.52 |
| Press `.` | 5200 | 52.00 |
| Press `0` | 52000 | 520.00 |

### ViewModel Pattern

```csharp
// Internal cents value for currency-style input (e.g., 523 = $5.23)
private long _numpadCentsValue = 0;

[RelayCommand]
private void KeyPress(string key)
{
    if (key == "DEL" || key == "BACKSPACE")
    {
        // Remove last digit by dividing by 10
        _numpadCentsValue = _numpadCentsValue / 10;
    }
    else if (key == "CLR" || key == "CLEAR")
    {
        // Clear all input
        _numpadCentsValue = 0;
    }
    else if (key == ".")
    {
        // Dot multiplies current value by 100 (shifts decimal right)
        // Example: If showing $5.00, pressing . makes it $500.00
        if (_numpadCentsValue < 100000000) // Prevent overflow (max $999,999.99)
        {
            _numpadCentsValue = _numpadCentsValue * 100;
        }
    }
    else
    {
        // Add digit - currency style (right to left with automatic decimal)
        if (int.TryParse(key, out int digit))
        {
            if (_numpadCentsValue < 100000000) // Prevent overflow
            {
                _numpadCentsValue = _numpadCentsValue * 10 + digit;
            }
        }
    }

    // Format as currency display (cents to dollars)
    decimal dollars = _numpadCentsValue / 100m;
    NumpadDisplayValue = dollars.ToString("F2");
}

/// <summary>
/// Resets the numpad to a specific dollar amount (used when loading balance due)
/// </summary>
private void SetNumpadAmount(decimal amount)
{
    _numpadCentsValue = (long)(amount * 100);
    NumpadDisplayValue = amount.ToString("F2");
}
```

### XAML Keypad Layout (Payment Views)

```xml
<!-- Standard Payment Keypad Layout -->
<UniformGrid Columns="3" Rows="4" Margin="8,0">
    <!-- Row 1: 7, 8, 9 -->
    <Button Content="7" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="7"/>
    <Button Content="8" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="8"/>
    <Button Content="9" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="9"/>

    <!-- Row 2: 4, 5, 6 -->
    <Button Content="4" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="4"/>
    <Button Content="5" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="5"/>
    <Button Content="6" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="6"/>

    <!-- Row 3: 1, 2, 3 -->
    <Button Content="1" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="1"/>
    <Button Content="2" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="2"/>
    <Button Content="3" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="3"/>

    <!-- Row 4: 0, ., DEL -->
    <Button Content="0" Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            Command="{Binding KeyPressCommand}" CommandParameter="0"/>
    <Button Content="." Style="{StaticResource NumberKeyButtonStyle}" Height="64"
            FontSize="28" FontWeight="Bold"
            Command="{Binding KeyPressCommand}" CommandParameter="."/>
    <Button Content="DEL" Style="{StaticResource DangerButtonStyle}" Height="64"
            FontSize="20" FontWeight="SemiBold"
            Command="{Binding KeyPressCommand}" CommandParameter="DEL"/>
</UniformGrid>
```

### Key Rules

| Rule | Description |
|------|-------------|
| **Always track cents internally** | Use `long` for cents, never `decimal` for input tracking |
| **Display as F2 format** | Always show 2 decimal places: `dollars.ToString("F2")` |
| **Include dot (.) button** | For shifting decimal right (e.g., $5.23 → $523.00) |
| **Prevent overflow** | Max value check: `_numpadCentsValue < 100000000` ($999,999.99) |
| **Use SetNumpadAmount()** | For programmatically setting values (e.g., balance due) |

### Example Views Using This Pattern

- `PayCheckView.xaml` - Payment amount entry
- `ChargeTipDialog.xaml` - Tip amount entry
- `CashPaymentDialog.xaml` - Cash tender entry

## IMPORTANT: Physical Keyboard Support

**All payment views with numeric keypads SHOULD support physical keyboard input** in addition to on-screen buttons. This allows users with attached keyboards to enter amounts efficiently.

### Approach

Use `OnPreviewKeyDown` (tunneling event) at the Window level to:
- Capture numeric keys before child elements process them
- Allow navigation keys (arrows, tab) to pass through for DataGrid/control interaction
- Route key presses to the existing `KeyPressCommand`

### Key Mappings

| Physical Key | Command Parameter | Action |
|--------------|-------------------|--------|
| 0-9 (number row) | "0"-"9" | Append digit |
| NumPad0-9 | "0"-"9" | Append digit |
| Period (.) | "." | Shift decimal right (×100) |
| NumPad Decimal | "." | Shift decimal right (×100) |
| Backspace | "DEL" | Remove last digit |
| Delete | "CLR" | Clear all input |
| Enter | N/A | Trigger primary action (e.g., payment) |
| Escape | N/A | Cancel/back |

### Code-Behind Pattern

```csharp
using System.Windows;
using System.Windows.Input;

public partial class PaymentView : Window
{
    private readonly PaymentViewModel _viewModel;

    public PaymentView(PaymentViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        DataContext = viewModel;
        Loaded += OnLoaded;
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        Focus(); // Enable keyboard input
    }

    protected override void OnPreviewKeyDown(KeyEventArgs e)
    {
        // Skip if processing is in progress
        if (!_viewModel.IsNotProcessingPayment)
        {
            base.OnPreviewKeyDown(e);
            return;
        }

        // Map key to numpad parameter
        string? keyParameter = MapKeyToParameter(e.Key);

        if (keyParameter != null)
        {
            if (_viewModel.KeyPressCommand.CanExecute(keyParameter))
            {
                _viewModel.KeyPressCommand.Execute(keyParameter);
                e.Handled = true;
                return;
            }
        }

        // Enter: Trigger primary action
        if (e.Key == Key.Enter)
        {
            // Add condition check (e.g., balance paid)
            if (_viewModel.PrimaryCommand.CanExecute(null))
            {
                _viewModel.PrimaryCommand.Execute(null);
                e.Handled = true;
                return;
            }
        }

        // Escape: Cancel/back
        if (e.Key == Key.Escape)
        {
            if (_viewModel.CancelCommand.CanExecute(null))
            {
                _viewModel.CancelCommand.Execute(null);
                e.Handled = true;
                return;
            }
        }

        base.OnPreviewKeyDown(e);
    }

    private static string? MapKeyToParameter(Key key)
    {
        return key switch
        {
            // Number row keys (0-9)
            Key.D0 => "0", Key.D1 => "1", Key.D2 => "2", Key.D3 => "3", Key.D4 => "4",
            Key.D5 => "5", Key.D6 => "6", Key.D7 => "7", Key.D8 => "8", Key.D9 => "9",
            // NumPad keys
            Key.NumPad0 => "0", Key.NumPad1 => "1", Key.NumPad2 => "2", Key.NumPad3 => "3", Key.NumPad4 => "4",
            Key.NumPad5 => "5", Key.NumPad6 => "6", Key.NumPad7 => "7", Key.NumPad8 => "8", Key.NumPad9 => "9",
            // Decimal point
            Key.OemPeriod => ".", Key.Decimal => ".",
            // Delete operations
            Key.Back => "DEL", Key.Delete => "CLR",
            // Not a numpad key
            _ => null
        };
    }
}
```

### Key Rules

| Rule | Description |
|------|-------------|
| **Use PreviewKeyDown** | Tunneling event captures keys before child elements |
| **Call Focus() on load** | Window must have focus to receive keyboard events |
| **Pass through navigation** | Don't handle arrow keys, Tab - let DataGrid use them |
| **Check processing state** | Disable input during async operations |
| **Reuse KeyPressCommand** | Route to same command as on-screen buttons |

### Example Views Using This Pattern

- `PayCheckView.xaml` - Payment amount entry with physical keyboard support

## Virtual Keyboard Integration

**Reference:** `TableSelectionView.xaml` for the recommended pattern

### Files
| File | Purpose |
|------|---------|
| `SI360.UI/Controls/VirtualKeyboard/VirtualKeyboard.xaml` | Keyboard control |
| `SI360.UI/Resources/Styles/VirtualKeyboardStyles.xaml` | Keyboard button styles |
| `SI360.UI/Behaviors/VirtualKeyboardBehavior.cs` | Attached behavior for auto-show |

### Method 1: VirtualKeyboardBehavior (Recommended)

Use the attached behavior for automatic keyboard popup on TextBox/ComboBox focus. This is the cleanest approach used in TableSelectionView.xaml.

**XAML Setup:**
```xml
<Window xmlns:behaviors="clr-namespace:SI360.UI.Behaviors">
    <Window.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="/SI360.UI;component/Resources/Styles/VirtualKeyboardStyles.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Window.Resources>

    <!-- TextBox with auto-popup keyboard -->
    <TextBox behaviors:VirtualKeyboardBehavior.IsEnabled="True"
             behaviors:VirtualKeyboardBehavior.EnablePredictiveText="True"
             behaviors:VirtualKeyboardBehavior.AutoHideDelay="0:0:10"/>

    <!-- ComboBox with auto-popup keyboard -->
    <ComboBox IsEditable="True"
              behaviors:VirtualKeyboardBehavior.IsEnabled="True"/>
</Window>
```

**Behavior Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `IsEnabled` | bool | false | Enables keyboard for control |
| `EnablePredictiveText` | bool | true | Shows word predictions |
| `PredictionSource` | IEnumerable<string> | null | Custom prediction words |
| `AutoHideDelay` | TimeSpan | 10s | Auto-hide timeout |
| `Placement` | PlacementMode | Bottom | Popup placement |

**Features:**
- Auto-shows as popup at screen bottom when control gains focus
- Auto-hides when clicking outside or after delay
- Full-width keyboard spanning screen
- Supports ComboBox with text search suppression
- Global close via `VirtualKeyboardBehavior.CloseAllKeyboards()`

### Keyboard Button Styles (from VirtualKeyboardStyles.xaml)

| Style Key | Usage |
|-----------|-------|
| `RegularKeyButtonStyle` | Standard letter keys |
| `NumberKeyButtonStyle` | Number row keys |
| `SpecialKeyButtonStyle` | Symbol/special character keys |
| `ModifierKeyButtonStyle` | Shift keys |
| `EnterKeyButtonStyle` | Enter key (green accent) |
| `BackspaceKeyButtonStyle` | Backspace key |
| `SpaceKeyButtonStyle` | Spacebar |
| `ArrowKeyButtonStyle` | Arrow navigation keys |

**Keyboard Layout:** QWERTY with special character mode toggle, Ctrl+C/V/X support

## Example Dialogs to Reference

| Dialog | Location | Type | Description |
|--------|----------|------|-------------|
| `ClosedCheckDialog.xaml` | SI360.UI/Views/ | Full-Screen | DataGrid with search, stats cards, selection panel, VIEW/REPRINT actions |
| `CheckDetailsDialog.xaml` | SI360.UI/Views/ | Centered | Auto-height detail view with labeled data grid, total display |
| `ReprintConfirmationDialog.xaml` | SI360.UI/Views/ | Centered | Auto-height success confirmation with icon and message |
| `CombineCheckDialog.xaml` | SI360.UI/Views/ | Full-Screen | Multi-select check list with stats cards, summary panel, Full-Screen footer |
| `PickUpDialog.xaml` | SI360.UI/Views/ | Centered | Order type confirmation with info notice, auto-height |
| `DeliveryDialog.xaml` | SI360.UI/Views/ | Centered | Order type confirmation with info notice, auto-height |
| `DineInDialog.xaml` | SI360.UI/Views/ | Centered | Order type confirmation with info notice, auto-height |

### Dialog Pattern: CombineCheckDialog

**Purpose:** Full-screen dialog for combining multiple checks into one
- User Function header style (`#8034495E`) with icon circle (`#024B8F`)
- Destination check info panel (`#401E3A5F` semi-transparent)
- Stats cards row (Available Checks, Total Available, Selected Total)
- Select All checkbox with `DarkCheckBoxStyle`
- Scrollable check list with `ModernScrollViewerStyle`
- Summary panel (`#401B3D1B` semi-transparent green)
- Full-Screen Layout footer with icon-based CANCEL/COMBINE CHECKS buttons

**Key Features:**
- Checkbox green: `#50FF7A` (12.4:1 contrast)
- Orange for totals: `#FFB84D` (9.8:1 contrast)
- Check badges: `#013A7A` Primary Blue
- Footer uses `ExitButtonStyle` for CANCEL, `CombineButtonStyle` for primary action
- Right-aligned button group with 15px spacing
- Footer negative margin: `-24,0,-24,-24` to extend to dialog edges

**Button Icons:**
| Button | Icon | Unicode |
|--------|------|---------|
| Header | Plus | `&#x2795;` |
| CANCEL | X Mark | `&#x2715;` |
| COMBINE CHECKS | Plus | `&#x2795;` |

**Footer Button Pattern:**
```xml
<Button Style="{DynamicResource ExitButtonStyle}" Height="64" Margin="0,0,15,0">
    <StackPanel Orientation="Horizontal">
        <TextBlock Text="&#x2715;" FontSize="20" Margin="20,0,8,0"/>
        <TextBlock Text="CANCEL" FontSize="20" FontWeight="SemiBold" Margin="0,0,20,0"/>
    </StackPanel>
</Button>
```

### Dialog Pattern: ClosedCheckDialog

**Purpose:** Full-screen dialog for viewing/reprinting closed checks
- User Function header style (`#8034495E`)
- Stats cards row (Total Checks, Revenue, Average)
- SearchTextBoxStyle with SVG Path icon
- DataGrid with `ReportDataGridStyle`, `DataGridHeaderStyle`
- Selection details panel with VIEW/REPRINT buttons
- ExitButtonStyle for close button

**Key Features:**
- `Width="AUTO"` on all DataGridTemplateColumns
- Stats cards use `#50FF7A` (revenue) and `#FFB84D` (average)
- Selection panel with `#401E3A5F` semi-transparent background

### Dialog Pattern: CheckDetailsDialog

**Purpose:** Auto-height centered dialog showing check details
- User Function header style (`#8034495E`)
- Check number badge (`#013A7A`)
- Labeled detail grid (TABLE, SERVER, ITEMS, CLOSED AT, PAYMENT)
- Total amount display with `#50FF7A` success green
- `SizeToContent="Height"` for dynamic sizing

**Static Method:** `CheckDetailsDialog.Show(owner, ClosedCheckItem)`

### Dialog Pattern: ReprintConfirmationDialog

**Purpose:** Auto-height success confirmation dialog
- User Function header with success icon (`#0F5132`)
- Check number badge centered
- Success checkmark icon (`#50FF7A`)
- Confirmation message
- `SizeToContent="Height"` for dynamic sizing

**Static Method:** `ReprintConfirmationDialog.Show(owner, checkNumber)`

### Dialog Pattern: Order Type Dialogs (PickUp, Delivery, DineIn)

**Purpose:** Auto-height confirmation dialogs for setting order type
- User Function header style (`#8034495E`)
- Circular icon badge (`#024B8F`) with order-type emoji
- Confirmation question message
- Info notice panel (`#40013A7A`) with Note label and description
- Two-button footer: Cancel (ExitButtonStyle) and Confirm (ConfirmButtonStyle)
- `SizeToContent="Height"` for dynamic sizing

**Key Features:**
- Border: `#013A7A` Primary Blue (2px, CornerRadius 10)
- Header icon circle: 48x48, `#024B8F`, CornerRadius 24
- Subtitle: `#CCCCCC` (10.5:1 contrast)
- Info panel: `#40013A7A` semi-transparent background
- Info icon circle: 40x40, `#013A7A`, CornerRadius 20
- Note label: 16px SemiBold `#CCCCCC`
- Note text: 16px `#AAAAAA` (7.4:1 contrast)
- Cancel button: `ExitButtonStyle` (14.7:1 contrast)
- Confirm button: `ConfirmButtonStyle` with `#013A7A` (9.3:1 contrast)
- Button layout: 1* / 12px gap / 1.5* column widths

**Order Type Icons:**
| Dialog | Emoji | Unicode |
|--------|-------|---------|
| PickUpDialog | Shopping Bags | `&#x1F6CD;` |
| DeliveryDialog | Delivery Truck | `&#x1F69A;` |
| DineInDialog | Fork and Knife | `&#x1F37D;` |

**Files:**
- `SI360.UI/Views/PickUpDialog.xaml`
- `SI360.UI/Views/DeliveryDialog.xaml`
- `SI360.UI/Views/DineInDialog.xaml`

## CRITICAL: Price Unit Systems & Formatting

**The SI360 database uses TWO distinct integer price scales. Using the wrong divisor causes 100x price errors.**

### Unit Systems

| System | Scale | Divisor | Used In |
|--------|-------|---------|---------|
| **Internal Units** | $1.00 = 10,000 | ÷ 10000 | `SaleItem` table: `ActualPrice`, `BasePrice`, `TaxablePrice`, `GrossPrice`, `TotalTax` |
| **Cents** | $1.00 = 100 | ÷ 100 | `Sale` table: `GratuityAmount`, `ServiceChargeAmount`, `Total`; `Discount` table: `DollarsOff`; `ItemPrice` table: `DefaultPrice`; Payment amounts |

### Conversion Rules

```csharp
// ✅ CORRECT — SaleItemDTO fields are in INTERNAL UNITS (÷10000 for dollars)
Price = saleItem.ActualPrice / 10000m;
Price = saleItem.BasePrice / 10000m;
Price = saleItem.TaxablePrice / 10000m;
DisplayPrice = $"${ActualPrice / 10000.0:F2}";

// ✅ CORRECT — Sale table fields are in CENTS (÷100 for dollars)
GrandTotal = payCheckData.GrandTotal / 100m;
TipAmount = tipCents / 100m;

// ❌ WRONG — Never divide SaleItemDTO prices by 100
Price = saleItem.ActualPrice / 100m;   // 100x TOO HIGH!
Price = saleItem.BasePrice / 100m;     // 100x TOO HIGH!
```

### Converting Between Systems

```csharp
// OrderItem.Price (dollars) → SaleItemDTO (internal units)
int priceInCents = (int)(orderItem.Price * 100);
int priceInternalUnits = priceInCents * 100;  // cents × 100

// SaleItemDTO (internal units) → cents
subtotalCents = (decimal)Math.Round(
    validItems.Sum(x => x.ActualPrice) / 10000m * 100m,
    MidpointRounding.AwayFromZero);
```

### Quick Reference

| Source Field | Type | Divide By | Result |
|-------------|------|-----------|--------|
| `SaleItemDTO.ActualPrice` | int | 10000m | dollars |
| `SaleItemDTO.BasePrice` | int | 10000m | dollars |
| `SaleItemDTO.TaxablePrice` | int | 10000m | dollars |
| `Sale.GratuityAmount` | int | 100m | dollars |
| `Sale.Total` | int | 100m | dollars |
| `Discount.DollarsOff` | int | 100m | dollars |
| `ItemPrice.DefaultPrice` | int | 100m | dollars |
| `OrderItem.Price` | decimal | — | already dollars |

### XAML Binding for Prices

```xml
<!-- For OrderItem.Price (already in dollars) -->
<TextBlock Text="{Binding Price, StringFormat=C}"/>

<!-- For SaleItemDTO (use DisplayPrice computed property) -->
<TextBlock Text="{Binding DisplayPrice}"/>
```

## Tasks

When the user requests frontend design help:

1. **New Dialog/View:** Create complete XAML with proper styles (prefer SharedStyles.xaml), ViewModel with [ObservableProperty] and [RelayCommand], and code-behind with event wiring

2. **Style Updates:** Follow the established dark theme, use brushes from SharedStyles.xaml for consistency

3. **Layout Issues:** Analyze Grid/StackPanel usage, suggest proper RowDefinitions/ColumnDefinitions

4. **Numpad Integration:** Reference QuantityInputDialog.xaml for numeric input patterns

5. **Keyboard Integration:** Reference VirtualKeyboard.xaml and VirtualKeyboardStyles.xaml

6. **Scrollable Content:** Use `ModernScrollViewerStyle` from SharedStyles.xaml

7. **Responsive Design:** Use Star sizing (*) for flexible layouts, Auto for content-based sizing

## Output Format

When creating new UI components:

1. **XAML file** - Complete markup with styles (prefer using SharedStyles.xaml)
2. **ViewModel** - Using CommunityToolkit.MVVM patterns
3. **Code-behind** - Minimal, only for Window-specific logic (focus, DialogResult)
4. **Usage example** - How to instantiate and show the dialog

Always address the user as **Rolen**.
