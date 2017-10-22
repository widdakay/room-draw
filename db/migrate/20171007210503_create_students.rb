class CreateStudents < ActiveRecord::Migration[5.1]
  def change
    create_table :students do |t|
      t.references :user, foreign_key: true
      t.references :room, foreign_key: true

      t.integer :class
      t.integer :room_draw_number
      t.boolean :has_participated

      t.timestamps
    end
  end
end
