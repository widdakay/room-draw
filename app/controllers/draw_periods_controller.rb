class DrawPeriodsController < ApplicationController
    before_action :set_draw_period, only: [:show, :edit, :update, :destroy]
    helper DrawPeriodHelper

    def index
        @draw_periods = DrawPeriod.all
    end
    
    def show
        @draw_period = DrawPeriod.find(params[:id])
    end

    def new
        @draw_period = DrawPeriod.new
    end

    def create
        @draw_period = DrawPeriod.new(draw_period_params)
        
        respond_to do |format|
            if @draw_period.save
                format.html { redirect_to root_path, notice: 'Draw Period was successfully scheduled.' }
                format.json { render :show, status: :created, location: @draw_period }
            else
                format.html { render :new }
                format.json { render json: @draw_period.errors, status: :unprocessable_entity }
            end
        end
    end

    def edit
        @draw_period = DrawPeriod.find(params[:id])
    end

    def update
        respond_to do |format|
            if @draw_period.update(draw_period_params)
                format.html { redirect_to root_path, notice: 'Draw Period was successfully updated.' }
                format.json { render :show, status: :ok, location: @draw_period }
            else
                format.html { render :edit }
                format.json { render json: @draw_period.errors, status: :unprocessable_entity }
            end
        end
    end

    def destroy
        @draw_period.destroy
        respond_to do |format|
            format.html { redirect_to draw_periods_url, notice: 'Draw Period was successfully canceled.' }
            format.json { head :no_content }
        end
    end

    private
        def set_draw_period
            @draw_period = DrawPeriod.find(params[:id])
        end
        
        def draw_period_params
            params.require(:draw_period).permit(:start, :end, :last_updated_by)
        end
end
