class CreateCurrencies < ActiveRecord::Migration
  def change
    create_table :currencies do |t|
      t.integer :curr_idSteam
      t.string :curr_deviseSigle
      t.string :curr_devise
      t.decimal :curr_tauxEuro, precision: 10, scale: 4

      t.timestamps
    end
  end
end
