module Jekyll
  class RenderPictureElement < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup
    end

    def render(context)
      site = context.registers[:site]

      @base_url = site.config['baseurl']
      @site_url = site.config['url']
      @assets_images = site.config['assets_images']

      @attributes = {}

      @markup.scan(Liquid::TagAttributes) do |key, value|
        @attributes[key] = value.gsub(/^'|"/, '').gsub(/'|"$/, '')
      end

      # Get the 1x path
      @image1x = @attributes['src']
      alt_text = @attributes['alt'] ? "alt=\"#{@attributes['alt']}\"" : ''

      if @image1x.include? "http" or @image1x.include? "https"
        """
        <figure>
          <a href=\"#{@image1x}\" target=\"_blank\">
            <picture>
              <source data-srcset=\"#{@image1x}\">
              <img src=\"#{@image1x}\"
                   srcset=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\"
                   data-sizes=\"auto\"
                   data-srcset=\"#{@image1x}\"
                   class=\"lazyload\" #{alt_text}>
            </picture>
          </a>
        </figure>
        """.strip
      else
        # Build the 2x image path from the 1x path
        @image2x_array = @image1x.split('.')
        filename2x = "#{@image2x_array[0]}@2x"
        @image2x = "#{filename2x}.#{@image2x_array[1]}"

        # Replace the images with the proper urls
        # @image1x = "#{@site_url}#{@base_url}#{@assets_images}/#{@image1x}"
        # @image2x = "#{@site_url}#{@base_url}#{@assets_images}/#{@image2x}"
        @image1x = "#{@assets_images}/#{@image1x}"
        @image2x = "#{@assets_images}/#{@image2x}"

        """
        <figure class=\"\">
          <a href=\"#{@image1x}\" target=\"_blank\">
            <picture>
              <source data-srcset=\"#{@image1x}, #{@image2x} 2x\">
              <img src=\"#{@image1x}\"
                   srcset=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\"
                   data-sizes=\"auto\"
                   data-srcset=\"#{@image1x}, #{@image2x} 2x\"
                   class=\"lazyload\" #{alt_text}>
            </picture>
          </a>
        </figure>
        """.strip
      end
    end
  end
end

Liquid::Template.register_tag('picture', Jekyll::RenderPictureElement)
