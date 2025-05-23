import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UtilityPrice {
  id: string;
  utility_type: string;
  price_per_unit: number;
  unit_name: string;
  currency: string;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
}

/**
 * Fetches the current price for a specified utility type
 * @param utilityType The type of utility ('electricity' or 'water')
 * @returns The current price information for the utility
 */
export const useFetchUtilityPrice = (utilityType: 'electricity' | 'water') => {
  return useQuery<UtilityPrice>({
    queryKey: ['utility-price', utilityType],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      console.log(`Fetching ${utilityType} price...`);
      
      const { data, error } = await supabase
        .from('utility_prices')
        .select('*')
        .eq('utility_type', utilityType)
        .lte('effective_from', now)
        .or(`effective_until.is.null,effective_until.gt.${now}`)
        .order('effective_from', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error(`Error fetching ${utilityType} price:`, error);
        // Instead of throwing, return a default value
        return {
          id: 'default',
          utility_type: utilityType,
          price_per_unit: utilityType === 'electricity' ? 0.35 : 2.50,
          unit_name: utilityType === 'electricity' ? 'kWh' : 'm³',
          currency: 'USD',
          effective_from: now,
          effective_until: null,
          created_at: now
        };
      }
      
      if (!data || data.length === 0) {
        console.warn(`No price found for ${utilityType}, inserting default`);
        // Create a default price record
        const defaultPrice: Omit<UtilityPrice, 'id' | 'created_at'> = {
          utility_type: utilityType,
          price_per_unit: utilityType === 'electricity' ? 0.35 : 2.50,
          unit_name: utilityType === 'electricity' ? 'kWh' : 'm³',
          currency: 'USD',
          effective_from: now,
          effective_until: null,
        };
        
        // Try to insert the default price for future use
        try {
          const { data: insertedPrice, error: insertError } = await supabase
            .from('utility_prices')
            .insert([defaultPrice])
            .select()
            .single();
            
          if (insertError) {
            console.error(`Error inserting default ${utilityType} price:`, insertError);
            return {
              id: 'default',
              ...defaultPrice,
              created_at: now
            };
          }
          
          console.info(`Inserted default ${utilityType} price:`, insertedPrice);
          return insertedPrice as UtilityPrice;
        } catch (insertErr) {
          console.error(`Failed to insert default ${utilityType} price:`, insertErr);
          return {
            id: 'default',
            ...defaultPrice,
            created_at: now
          };
        }
      }
      
      console.info(`Successfully fetched ${utilityType} price:`, data[0]);
      return data[0] as UtilityPrice;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests
  });
};

/**
 * Fetches all price records for utility price management
 * @returns All utility price records
 */
export const useFetchAllUtilityPrices = () => {
  return useQuery<UtilityPrice[]>({
    queryKey: ['utility-prices-all'],
    queryFn: async () => {
      console.log("Fetching all utility prices...");
      
      const { data, error } = await supabase
        .from('utility_prices')
        .select('*')
        .order('utility_type', { ascending: true })
        .order('effective_from', { ascending: false });
      
      if (error) {
        console.error('Error fetching all utility prices:', error);
        return []; // Return empty array instead of throwing
      }
      
      console.info("Successfully fetched all utility prices:", data);
      return data as UtilityPrice[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Adds a new utility price record
 * @param price The price record to add
 * @returns The added price record
 */
export const addUtilityPrice = async (price: Omit<UtilityPrice, 'id' | 'created_at'>) => {
  console.log("Adding utility price:", price);
  
  const { data, error } = await supabase
    .from('utility_prices')
    .insert([price])
    .select();
  
  if (error) {
    console.error('Error adding utility price:', error);
    throw error;
  }
  
  console.info("Successfully added utility price:", data[0]);
  return data[0];
};

/**
 * Updates an existing utility price record
 * @param id The ID of the price record to update
 * @param price The updated price data
 * @returns The updated price record
 */
export const updateUtilityPrice = async (
  id: string, 
  price: Partial<Omit<UtilityPrice, 'id' | 'created_at'>>
) => {
  const { data, error } = await supabase
    .from('utility_prices')
    .update(price)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating utility price:', error);
    throw error;
  }
  
  return data[0];
};

/**
 * Deletes a utility price record
 * @param id The ID of the price record to delete
 */
export const deleteUtilityPrice = async (id: string) => {
  const { error } = await supabase
    .from('utility_prices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting utility price:', error);
    throw error;
  }
};
