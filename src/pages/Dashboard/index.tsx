import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { FoodInterface } from '../../interfaces/FoodInterface';



export default function Dashboard() {
  const [foods, setFoods] = useState<FoodInterface[]>([]);
  const [editingFood, setEditingFood] = useState<FoodInterface>({} as FoodInterface);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleAddFood = async (food: FoodInterface) => {
    try {
      const response = await api.post<FoodInterface>('/foods', {
        ...food,
        available: true,
      });

      setFoods(oldState => [...oldState, response.data]);
    } catch(err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodInterface) => {
    try {
      const updatedFood = await api.put<FoodInterface>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food }
      );

      setFoods(oldState => {
        return oldState.map(food => food.id !== updatedFood.data.id? food: updatedFood.data);
      });

    } catch(err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);
    setFoods(oldState => oldState.filter(food => food.id !== id));
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  }

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  }

  const handleEditFood = (food: FoodInterface) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  useEffect(() => {
    const loadFoods = async () => {
      const response = await api.get('/foods');
      if(response) {
        return response.data;
      }
  
      return [];
    }

    loadFoods();
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}