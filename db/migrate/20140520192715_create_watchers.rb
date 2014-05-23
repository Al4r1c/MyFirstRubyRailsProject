class CreateWatchers < ActiveRecord::Migration
  def change
    create_table :watchers do |t|
      t.string :wat_libelle
      t.string :wat_qualite
      t.string :wat_lien
      t.decimal :wat_prixAlert, precision: 8, scale: 2
      t.datetime :wat_dateAjout

      t.timestamps
    end
  end
end
