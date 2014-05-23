require 'open-uri'

class WatcherController < ApplicationController
  def index
    @watcherLinks = Watcher.all
  end

  def add
    lien = params['lien']

    unWatcher = Watcher.create(
        :wat_dateAjout => DateTime.now.to_date,
        :wat_libelle => params['libelle'],
        :wat_lien => lien,
        :wat_qualite => params['qualite'])


    if unWatcher.save
      render :text => unWatcher.id
    end
  end

  def update
    if Watcher.update(params['id'], :wat_libelle => params['libelle'], :wat_qualite => params['qualite'],
                      :wat_lien => params['lien'])
      render :text => '1'
    end
  end

  def delete
    if Watcher.destroy(params['id'])
      render :text => '1'
    end
  end

  def recherche
    file = open('http://google.fr/')
    contents = file.read
    puts contents

    render :text => '1'
  end
end
