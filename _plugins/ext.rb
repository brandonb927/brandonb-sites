module Jekyll
  require "kramdown"
  class RenderPictureElement < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      site = context.registers[:site]
      page = context.environments.first['page']

      @base_url = site.config['baseurl']
      @site_url = site.config['url']
      @media_root = "#{site.config['assets_media']}/#{page['layout']}s"

      @attributes = {}

      @markup.scan(Liquid::TagAttributes) do |key, value|
        @attributes[key] = value.gsub(/^'|"/, '').gsub(/'|"$/, '')
      end

      # Get the 1x path
      @src = @attributes['src']
      # @alt_text = @attributes['alt']
      @alt_text = Kramdown::Document.new(@attributes['alt']).to_html

      if @src.include? "http" or @src.include? "https"
        """
        <figure>
          <picture>
            <source data-srcset=\"#{@src}\">
            <img src=\"#{@src}\"
              srcset=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\"
              data-sizes=\"auto\"
              data-srcset=\"#{@src}\"
              class=\"styled-image lazyload\" alt=\"#{@alt_text}\">
          </picture>
          <figcaption>
            #{@alt_text}
          </figcaption>
        </figure>
        """.strip
      else
        # Special case for gifs, just pass them through
        if @src.end_with? ".gif"
          @image1x = "#{@media_root}/#{@src}"
          @data_srcset = "#{@image1x}"
        else
          # Build the 2x image path from the 1x path
          @image2x_array = @image1x.split('.')
          filename2x = "#{@image2x_array[0]}@2x"
          @image2x = "#{filename2x}.#{@image2x_array[1]}"

          # Replace the images with the proper urls
          @image1x = "#{@media_root}/#{@src}"
          @image2x = "#{@media_root}/#{@image2x}"
          @data_srcset = "#{@image1x}, #{@image2x} 2x"
        end

        """
        <figure>
          <picture>
            <source data-srcset=\"#{@data_srcset}\">
            <img src=\"#{@image1x}\"
              srcset=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\"
              data-sizes=\"auto\"
              data-srcset=\"#{@data_srcset}\"
              class=\"styled-image lazyload\" alt=\"#{@alt_text}\">
          </picture>
          <figcaption>
            #{@alt_text}
          </figcaption>
        </figure>
        """.strip
      end
    end
  end

  class RenderVideoElement < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      site = context.registers[:site]
      page = context.environments.first['page']

      @base_url = site.config['baseurl']
      @site_url = site.config['url']
      @media_root = "#{site.config['assets_media']}/#{page['layout']}s"

      @attributes = {}

      @markup.scan(Liquid::TagAttributes) do |key, value|
        @attributes[key] = value.gsub(/^'|"/, '').gsub(/'|"$/, '')
      end

      @attr_src = @attributes['src']
      @attr_height = @attributes['height'] ? @attributes['height'] : 320

      # Replace the images with the proper urls
      @src_path = "#{@media_root}/#{@attr_src}"

      """
      <video width=\"100%\" height=\"#{@attr_height}\" controls>
        <source src=\"#{@src_path}\" type=\"video/mp4\"/>
        <p>Hmm, your browser doesn't seem to support HTML5 video. <a href=\"#{@src_path}\">You can download this video instead</a>.</p>
      </video>
      """.strip
    end
  end

  module Last90DaysFilter
    def last_90_days_filter(posts)
      now = DateTime.now
      today = DateTime.new(now.year, now.month, now.day, 0, 0, 0, now.zone)
      target = today - 90

      posts.select do |post|
        postedOn = post.data['date'].to_datetime

        if postedOn < today && postedOn > target
          post
        end
      end
    end
  end
end

Liquid::Template.register_tag('picture', Jekyll::RenderPictureElement)
Liquid::Template.register_tag('video', Jekyll::RenderVideoElement)
Liquid::Template.register_filter(Jekyll::Last90DaysFilter)

