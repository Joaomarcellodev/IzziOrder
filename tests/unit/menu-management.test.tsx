import { render, screen } from "@testing-library/react";
import { MenuManagement } from "@/components/organisms/menu-management";
import "@testing-library/jest-dom";

// Mock the dnd provider to avoid issues
jest.mock("react-dnd", () => ({
  useDrag: () => [{}, () => {}],
  useDrop: () => [{}, () => {}],
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: {},
}));

// Mock the actions
jest.mock("@/app/actions/menu-item-actions", () => ({
  updateMenuItemAvailability: jest.fn(),
  deleteMenuItem: jest.fn(),
  updateMenuItem: jest.fn(),
  createMenuItem: jest.fn(),
  updateMenuOrdernation: jest.fn(),
}));

jest.mock("@/app/actions/category-actions", () => ({
  createCategory: jest.fn(),
  deleteCategory: jest.fn(),
  updateCategory: jest.fn(),
}));

const mockMenuItems = [
  {
    id: "1",
    name: "Pizza Margherita",
    description: "Classic pizza",
    price: 30,
    categoryId: "cat1",
    imageUrl: "/pizza.jpg",
    available: true,
    category_id: "cat1",
  },
];

const mockCategories = [
  { id: "cat1", name: "Pizzas" },
  { id: "cat2", name: "Drinks" },
];

describe("MenuManagement Component", () => {
  it("renders correctly with menu items and categories", () => {
    render(<MenuManagement menuItems={mockMenuItems as any} categories={mockCategories} />);
    
    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
    expect(screen.getByText("R$ 30.00")).toBeInTheDocument();
    expect(screen.getByText("Todas as Categorias")).toBeInTheDocument();
    expect(screen.getByText("Gerenciar Categorias")).toBeInTheDocument();
  });

  it("opens the 'Adicionar Item' modal when clicking the button", () => {
    render(<MenuManagement menuItems={mockMenuItems as any} categories={mockCategories} />);
    
    const addButton = screen.getByText("Adicionar Item");
    addButton.click();
    
    expect(screen.getByText("Novo Item")).toBeInTheDocument();
  });
});
